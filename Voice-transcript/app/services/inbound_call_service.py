"""InboundCallService — Twilio inbound webhook handlers + background processor.

- handle_inbound_voice: resolve org from `To`, return greeting TwiML (either the
  org's pre-recorded MP3 via <Play>, or an English <Say> fallback).

- handle_inbound_status: updates the Call row's status + duration on call end,
  and mirrors the outcome onto UnknownInbound if that's where this CallSid lives.

- process_inbound_background: matches the caller to a Lead; on match, inserts a
  Call row, flips the Lead to פולו אפ with follow_up_date=now, and fans out
  in-app notifications to every active org user. On miss, records an
  UnknownInbound row + notifications.
"""
import logging
from datetime import datetime
from typing import Any, Mapping, Optional
from xml.sax.saxutils import escape as xml_escape

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import async_session_maker
from app.models.base import (
    Call,
    InboundCallNotification,
    Lead,
    LeadStatusHistory,
    Organization,
    OrgPhoneNumber,
    UnknownInbound,
    User,
)
from app.services.lead_service import e164_to_israeli_domestic

logger = logging.getLogger(__name__)

# Twilio has no Hebrew TTS voice — we <Play> a pre-recorded MP3 per org. When
# an org hasn't uploaded one yet, fall back to an English <Say> (Polly Joanna).
_POLLY_ENGLISH_VOICE = "Polly.Joanna-Neural"
_ENGLISH_FALLBACK_TEXT = "Thanks for calling. An agent will call you back shortly."


def _twiml_play_or_english(greeting_audio_url: Optional[str]) -> str:
    """Render greeting TwiML.

    - If the org has a `greeting_audio_url` set → <Play>{url}</Play>.
    - Otherwise → English <Say> fallback.
    """
    url = (greeting_audio_url or "").strip()
    if url:
        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            f'<Response><Play>{xml_escape(url)}</Play><Hangup/></Response>'
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        f'<Response><Say voice="{_POLLY_ENGLISH_VOICE}">'
        f'{xml_escape(_ENGLISH_FALLBACK_TEXT)}</Say><Hangup/></Response>'
    )


def _twiml_empty() -> str:
    return '<?xml version="1.0" encoding="UTF-8"?><Response/>'


async def _resolve_org(db: AsyncSession, to_phone_e164: str) -> Optional[Organization]:
    """Resolve the Organization that owns `To` (Twilio number, E.164)."""
    if not to_phone_e164:
        return None
    # OrgPhoneNumber.phone_number is stored as the org wrote it — match E.164
    # first, then the domestic form as a fallback.
    result = await db.execute(
        select(OrgPhoneNumber).where(OrgPhoneNumber.phone_number == to_phone_e164)
    )
    phone_row = result.scalars().first()
    if phone_row is None:
        domestic = e164_to_israeli_domestic(to_phone_e164)
        if domestic:
            result = await db.execute(
                select(OrgPhoneNumber).where(OrgPhoneNumber.phone_number == domestic)
            )
            phone_row = result.scalars().first()

    if phone_row is None:
        return None

    org = (
        await db.execute(select(Organization).where(Organization.org_id == phone_row.org_id))
    ).scalars().first()
    return org


async def handle_inbound_voice(db: AsyncSession, form: Mapping[str, Any]) -> str:
    """Synchronous handler for Twilio's "a call comes in" webhook.

    Returns TwiML. Must run fast (Twilio ~15s timeout). Matching + notification
    happen in `process_inbound_background`.
    """
    call_sid = form.get("CallSid")
    to_phone = form.get("To") or ""

    if not call_sid:
        logger.warning("inbound-voice received without CallSid; ignoring")
        return _twiml_empty()

    org = await _resolve_org(db, to_phone)
    if org is None:
        logger.warning("inbound-voice: unknown To number %s, returning English fallback", to_phone)
        return _twiml_play_or_english(None)

    return _twiml_play_or_english(org.greeting_audio_url)


async def handle_inbound_status(db: AsyncSession, form: Mapping[str, Any]) -> str:
    """Status callback — fires at completed/no-answer/busy/failed.

    Updates whichever row owns this CallSid (Call or UnknownInbound) with the
    final duration + outcome. Safe to call multiple times.
    """
    call_sid = form.get("CallSid")
    status = form.get("CallStatus")
    duration_raw = form.get("CallDuration")

    if not call_sid:
        return _twiml_empty()

    duration_sec: Optional[int] = None
    if duration_raw:
        try:
            duration_sec = int(duration_raw)
        except (TypeError, ValueError):
            duration_sec = None

    # Try Call first (matched lead path).
    result = await db.execute(select(Call).where(Call.twilio_sid == call_sid))
    call = result.scalars().first()
    if call is not None:
        if status:
            call.status = status
        if duration_sec is not None:
            call.duration = duration_sec
        await db.commit()
        return _twiml_empty()

    # Fall back to UnknownInbound (unknown-caller path).
    result = await db.execute(
        select(UnknownInbound).where(UnknownInbound.twilio_call_sid == call_sid)
    )
    unk = result.scalars().first()
    if unk is not None:
        if status:
            unk.outcome = status
        if duration_sec is not None:
            unk.call_duration_sec = duration_sec
        await db.commit()

    return _twiml_empty()


async def _active_org_user_ids(db: AsyncSession, org_id) -> list:
    rows = await db.execute(
        select(User.user_id).where(User.org_id == org_id, User.is_active == True)  # noqa: E712
    )
    return [r[0] for r in rows.all()]


async def _fan_out_notifications(
    db: AsyncSession,
    *,
    org_id,
    caller_display: str,
    campaign_name: Optional[str],
    call_id=None,
    unknown_id=None,
    lead_id=None,
) -> None:
    """Insert one InboundCallNotification per active org user.

    Partial-unique indexes (uq_inboundnotif_user_call_kind /
    uq_inboundnotif_user_unknown_kind) dedupe on retry, so the caller doesn't
    need to check first.
    """
    user_ids = await _active_org_user_ids(db, org_id)
    for uid in user_ids:
        db.add(
            InboundCallNotification(
                user_id=uid,
                org_id=org_id,
                kind="inbound_call",
                call_id=call_id,
                unknown_id=unknown_id,
                lead_id=lead_id,
                caller_display=caller_display,
                campaign_name=campaign_name,
            )
        )


async def _process_inbound(
    db: AsyncSession,
    call_sid: str,
    to_phone: str,
    from_phone: str,
    started_at: datetime,
) -> None:
    org = await _resolve_org(db, to_phone)
    if org is None:
        logger.warning("inbound-bg: unknown To number %s, skipping", to_phone)
        return

    # Idempotency: if a Call or UnknownInbound already exists for this CallSid,
    # a previous webhook retry already processed it.
    existing_call = (
        await db.execute(select(Call).where(Call.twilio_sid == call_sid))
    ).scalars().first()
    if existing_call is not None:
        logger.info("inbound-bg: Call already exists for sid=%s, skipping", call_sid)
        return
    existing_unknown = (
        await db.execute(select(UnknownInbound).where(UnknownInbound.twilio_call_sid == call_sid))
    ).scalars().first()
    if existing_unknown is not None:
        logger.info("inbound-bg: UnknownInbound already exists for sid=%s, skipping", call_sid)
        return

    from_domestic = e164_to_israeli_domestic(from_phone) if from_phone else None

    # Match to a Lead by (org_id, phone_number). Lead phone_number is stored as
    # domestic (0XXXXXXXXX). Prefer the most-recently-created match if the same
    # number appears in multiple campaigns.
    lead: Optional[Lead] = None
    if from_domestic:
        result = await db.execute(
            select(Lead)
            .where(Lead.org_id == org.org_id, Lead.phone_number == from_domestic)
            .order_by(Lead.created_at.desc())
        )
        lead = result.scalars().first()

    if lead is not None:
        # Use the lead's assigned caller if we have one, else the creator — Call
        # requires a non-null user_id. Neither field is a perfect fit for "who
        # answered the inbound" (we don't know yet), but both reference a real
        # org user, which is what the FK needs.
        acting_user_id = lead.called_by or lead.created_by

        call = Call(
            org_id=org.org_id,
            user_id=acting_user_id,
            campaign_id=lead.campaign_id,
            lead_id=lead.lead_id,
            twilio_sid=call_sid,
            destination=from_phone or from_domestic,
            direction="inbound",
            status="initiated",
            created_at=started_at,
        )
        db.add(call)
        await db.flush()  # populate call.call_id for notifications

        old_status = (lead.status or {}).get("current", "") if lead.status else ""
        options = (lead.status or {}).get("options") if lead.status else None
        if not options:
            options = ["ממתין", "ענה", "לא ענה", "לא רלוונטי", "עסקה נסגרה", "פולו אפ", "אל תתקשר"]

        now = datetime.utcnow()
        lead.status = {"current": "פולו אפ", "options": options}
        lead.follow_up_date = now

        db.add(
            LeadStatusHistory(
                lead_id=lead.lead_id,
                org_id=lead.org_id,
                user_id=acting_user_id,
                old_status=old_status,
                new_status="פולו אפ",
                follow_up_date=now,
                comment="Inbound call from lead — auto follow-up",
            )
        )

        await _fan_out_notifications(
            db,
            org_id=org.org_id,
            caller_display=lead.name or from_domestic or from_phone or "Unknown",
            campaign_name=lead.campaign_name,
            call_id=call.call_id,
            lead_id=lead.lead_id,
        )

        await db.commit()
        logger.info(
            "inbound-bg: matched lead=%s campaign=%s sid=%s",
            lead.lead_id, lead.campaign_id, call_sid,
        )
        return

    # No lead match — record as UnknownInbound and notify.
    unk = UnknownInbound(
        org_id=org.org_id,
        caller_phone=from_phone or None,
        caller_phone_domestic=from_domestic,
        to_phone=to_phone,
        twilio_call_sid=call_sid,
        received_at=started_at,
    )
    db.add(unk)
    await db.flush()

    await _fan_out_notifications(
        db,
        org_id=org.org_id,
        caller_display=from_domestic or from_phone or "Unknown",
        campaign_name=None,
        unknown_id=unk.unknown_id,
    )

    await db.commit()
    logger.info("inbound-bg: unknown caller sid=%s from=%s", call_sid, from_phone)


async def process_inbound_background(
    call_sid: str,
    to_phone: str,
    from_phone: str,
    started_at: datetime,
) -> None:
    """Background worker: match caller to lead, write Call/UnknownInbound, notify.

    Opens its own AsyncSession because FastAPI BackgroundTasks run after the
    request session has been closed.
    """
    async with async_session_maker() as db:
        try:
            await _process_inbound(db, call_sid, to_phone, from_phone, started_at)
        except Exception:
            await db.rollback()
            logger.exception("inbound-bg: failed to process sid=%s", call_sid)
