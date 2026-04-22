"""Lead Briefing Service.

Generates a short, agent-facing Hebrew briefing for a single lead from that
lead's fields (structured columns + `extra_data`). The briefing is produced
synchronously via the Groq LLM client, persisted one-per-lead, and surfaced on
the lead's call-timeline card.

This module intentionally does NOT pull in call history, transcripts, or prior
call summaries — that is a separate, future feature (spec FR-021).
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any, Optional, Tuple
from uuid import UUID
from zoneinfo import ZoneInfo

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.integrations.llm_client import LLMClient
from app.models.base import Campaign, CampaignSettings, Lead, LeadBriefing, User

logger = logging.getLogger(__name__)

ISRAEL_TZ = ZoneInfo("Asia/Jerusalem")

DEFAULT_BRIEFING_PROMPT_VERSION = "default-v1"
CAMPAIGN_CUSTOM_PROMPT_VERSION = "campaign-custom"

DEFAULT_BRIEFING_PROMPT = """\
אתה עוזר למוקדן ישראלי בחברה שמתקשרת לבעלי נכסים שמעוניינים למכור או להשכיר
(דירות, בתים, נדל"ן). הלידים *אינם* קונים פוטנציאליים — הם בעלי הנכס שמציעים אותו.
קיבלת את נתוני הליד בפורמט JSON. צור תקציר קצר בעברית (פסקה אחת, 3–6 משפטים)
שמטרתו להכין את המוקדן לשיחה הקרובה. התקציר חייב לכלול:
  1) מי הליד (שם, מקום, פרטים חשובים),
  2) איזה נכס הוא מציע ובאילו תנאים (סוג הנכס, גודל, מחיר, מכירה או השכרה, כל פרט רלוונטי שמופיע בשדות),
  3) זווית פתיחה מומלצת אחת לשיחה.
אל תמציא מידע שלא קיים בנתונים. אם יש מעט מידע, אמור זאת בקצרה.
אין להזכיר שיחות קודמות או תמלילי שיחות — אלה אינם מסופקים.
החזר רק את הפסקה עצמה, ללא כותרות וללא פורמט נוסף.
"""

MAX_INPUT_CHARS = 6000
MAX_PROMPT_OVERRIDE_CHARS = 4000


class BriefingGenerationError(Exception):
    """Raised when Groq returns an empty or unusable response. The caller
    maps this to HTTP 502 and does NOT persist a briefing row."""


def _to_israel_iso(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        # Stored UTC-naive (datetime.utcnow) — attach UTC then convert.
        from datetime import timezone

        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(ISRAEL_TZ).isoformat()


def _build_input_payload(lead: Lead, campaign: Optional[Campaign]) -> str:
    """Serialize the LLM input as a JSON block (Hebrew preserved)."""
    status_value: Optional[str] = None
    if isinstance(lead.status, dict):
        status_value = lead.status.get("current")

    payload: dict[str, Any] = {
        "lead": {
            "name": lead.name,
            "phone_number": lead.phone_number,
            "email": lead.email,
            "status": status_value,
            "follow_up_date": _to_israel_iso(lead.follow_up_date),
            "created_at": _to_israel_iso(lead.created_at),
            "last_call_at": _to_israel_iso(lead.last_call_at),
            "tried_to_reach": lead.tried_to_reach,
            "sum_calls_performed": lead.sum_calls_performed,
            "extra_data": lead.extra_data,
        },
        "campaign": {
            "name": campaign.name if campaign is not None else None,
        },
    }

    as_json = json.dumps(payload, ensure_ascii=False, indent=2)
    if len(as_json) > MAX_INPUT_CHARS and lead.extra_data:
        # Defensive truncation — drop extra_data keys in insertion order.
        trimmed = dict(lead.extra_data)
        while trimmed and len(as_json) > MAX_INPUT_CHARS:
            trimmed.pop(next(iter(trimmed)))
            payload["lead"]["extra_data"] = {**trimmed, "...": "truncated"}
            as_json = json.dumps(payload, ensure_ascii=False, indent=2)

    return f"נתוני הליד (JSON):\n{as_json}"


async def get_briefing(
    session: AsyncSession,
    org_id: UUID,
    lead_id: UUID,
) -> Optional[LeadBriefing]:
    """Return the current briefing for a lead (tenant-scoped). None if missing."""
    stmt = (
        select(LeadBriefing)
        .join(Lead, Lead.lead_id == LeadBriefing.lead_id)
        .where(LeadBriefing.lead_id == lead_id)
        .where(Lead.org_id == org_id)
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def create_or_regenerate_briefing(
    session: AsyncSession,
    current_user: User,
    lead_id: UUID,
    llm_client: Optional[LLMClient] = None,
) -> Tuple[LeadBriefing, bool]:
    """Generate a briefing for `lead_id` and upsert the `leadbriefing` row.

    Returns `(briefing, created)` where `created` is True on first-time insert
    and False on regenerate. Raises:
      - HTTPException(404) if the lead does not exist or belongs to another org.
      - HTTPException(422) if the lead has no associated campaign.
      - BriefingGenerationError if Groq returns empty output.
    """
    # Load the lead tenant-scoped and eager-load the campaign/settings chain.
    lead_stmt = (
        select(Lead)
        .where(Lead.lead_id == lead_id)
        .where(Lead.org_id == current_user.org_id)
        .options(selectinload(Lead.campaign).selectinload(Campaign.settings))
    )
    lead_result = await session.execute(lead_stmt)
    lead = lead_result.scalar_one_or_none()
    if lead is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )

    campaign = lead.campaign
    if campaign is None:
        # Spec invariant: every lead has a campaign. Surface data corruption
        # explicitly rather than silently using the default prompt.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Lead has no associated campaign",
        )

    settings: Optional[CampaignSettings] = campaign.settings
    override = settings.briefing_prompt_override if settings is not None else None

    if override and override.strip():
        effective_prompt = override.strip()
        prompt_version = CAMPAIGN_CUSTOM_PROMPT_VERSION
    else:
        effective_prompt = DEFAULT_BRIEFING_PROMPT
        prompt_version = DEFAULT_BRIEFING_PROMPT_VERSION

    user_prompt = _build_input_payload(lead, campaign)

    client = llm_client or LLMClient(model="fast")
    try:
        raw = client.complete(
            system_prompt=effective_prompt,
            user_prompt=user_prompt,
            temperature=0.3,
            max_tokens=400,
        )
    except Exception as exc:
        logger.exception("Groq briefing generation failed for lead %s", lead_id)
        raise BriefingGenerationError(str(exc)) from exc

    briefing_text = (raw or "").strip()
    if not briefing_text:
        raise BriefingGenerationError("LLM returned an empty briefing")

    now = datetime.utcnow()

    # Detect insert vs. update up front (ON CONFLICT can't easily report it).
    existing_id_stmt = select(LeadBriefing.briefing_id).where(
        LeadBriefing.lead_id == lead_id
    )
    existing_id = (await session.execute(existing_id_stmt)).scalar_one_or_none()
    created = existing_id is None

    upsert_stmt = (
        pg_insert(LeadBriefing)
        .values(
            lead_id=lead_id,
            org_id=lead.org_id,
            briefing_text=briefing_text,
            prompt_used=effective_prompt,
            prompt_version=prompt_version,
            generated_by=current_user.user_id,
            generated_at=now,
            updated_at=now,
        )
        .on_conflict_do_update(
            index_elements=["lead_id"],
            set_={
                "briefing_text": briefing_text,
                "prompt_used": effective_prompt,
                "prompt_version": prompt_version,
                "generated_by": current_user.user_id,
                "generated_at": now,
                "updated_at": now,
            },
        )
    )
    await session.execute(upsert_stmt)
    await session.commit()

    # Expire the session so the subsequent SELECT doesn't hand back a stale
    # ORM-cached copy from the pre-upsert state.
    session.expire_all()

    fresh_stmt = select(LeadBriefing).where(LeadBriefing.lead_id == lead_id)
    fresh = (await session.execute(fresh_stmt)).scalar_one()
    return fresh, created
