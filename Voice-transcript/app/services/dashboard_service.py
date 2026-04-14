from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.base import Lead, Contact, Campaign, Call, User


# ── Helpers ───────────────────────────────────────────────────────

def _today_range_israel():
    """
    Returns (start_of_day_utc, end_of_day_utc) for today in Israel time (Asia/Jerusalem).
    All datetimes in the DB are stored as UTC-naive values, so we shift by the Israel
    wall-clock offset before comparing.
    """
    israel_tz = ZoneInfo("Asia/Jerusalem")
    now_israel = datetime.now(israel_tz)

    # Start and end of today in Israel local time → convert to UTC naive for DB comparison
    start_local = now_israel.replace(hour=0, minute=0, second=0, microsecond=0)
    end_local   = now_israel.replace(hour=23, minute=59, second=59, microsecond=999999)

    start_utc = start_local.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
    end_utc   = end_local.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)

    return start_utc, end_utc


# ── Service ───────────────────────────────────────────────────────

async def get_overview(db: AsyncSession, current_user: User) -> dict:
    """
    Returns all dashboard data scoped to the current user's organisation.
    All time-sensitive queries use Israel time (Asia/Jerusalem / UTC+2 / UTC+3 DST).
    """
    org_id: UUID = current_user.org_id
    today_start, today_end = _today_range_israel()

    # ── 1. Total Leads ─────────────────────────────────────────────
    total_leads_result = await db.execute(
        select(func.count(Lead.lead_id)).where(Lead.org_id == org_id)
    )
    total_leads: int = total_leads_result.scalar() or 0

    # ── 2. Total Contacts ──────────────────────────────────────────
    total_contacts_result = await db.execute(
        select(func.count(Contact.contact_id)).where(Contact.org_id == org_id)
    )
    total_contacts: int = total_contacts_result.scalar() or 0

    # ── 3. Closed Deals ────────────────────────────────────────────
    # Lead.status is a HebrewJSON column: {"current": "...", "options": [...]}
    # We cast the JSON field to text and match the Hebrew status value.
    all_leads_result = await db.execute(
        select(Lead.status).where(Lead.org_id == org_id)
    )
    all_statuses = all_leads_result.scalars().all()
    closed_deals: int = sum(
        1 for s in all_statuses
        if isinstance(s, dict) and s.get("current") == "עסקה נסגרה"
    )

    # ── 4. Follow-ups Today ────────────────────────────────────────
    # Leads whose status->current == "פולו אפ" AND follow_up_date falls today (Israel time)
    followup_leads_result = await db.execute(
        select(Lead.lead_id, Lead.name, Lead.campaign_name, Lead.follow_up_date, Lead.status)
        .where(
            Lead.org_id == org_id,
            Lead.follow_up_date >= today_start,
            Lead.follow_up_date <= today_end,
        )
    )
    followup_rows = followup_leads_result.all()

    follow_ups_today = [
        {
            "lead_id": str(row.lead_id),
            "name": row.name,
            "campaign_name": row.campaign_name,
            "follow_up_date": row.follow_up_date.isoformat() if row.follow_up_date else None,
        }
        for row in followup_rows
        if isinstance(row.status, dict) and row.status.get("current") == "פולו אפ"
    ]

    # ── 5. Campaigns with lead counts ──────────────────────────────
    campaigns_result = await db.execute(
        select(Campaign).where(Campaign.org_id == org_id)
    )
    campaigns = campaigns_result.scalars().all()

    # Count leads per campaign in a single aggregated query
    leads_per_campaign_result = await db.execute(
        select(Lead.campaign_id, func.count(Lead.lead_id).label("leads_count"))
        .where(Lead.org_id == org_id)
        .group_by(Lead.campaign_id)
    )
    leads_count_map: dict[UUID, int] = {
        row.campaign_id: row.leads_count
        for row in leads_per_campaign_result.all()
    }

    campaigns_data = [
        {
            "campaign_id": str(c.campaign_id),
            "name": c.name,
            "status": c.status,
            "leads_count": leads_count_map.get(c.campaign_id, 0),
        }
        for c in campaigns
    ]

    # ── 6. Total Calls & Calls Today ──────────────────────────────
    total_calls_result = await db.execute(
        select(func.count(Call.call_id)).where(Call.org_id == org_id)
    )
    total_calls: int = total_calls_result.scalar() or 0

    total_calls_today_result = await db.execute(
        select(func.count(Call.call_id)).where(
            Call.org_id == org_id,
            Call.created_at >= today_start,
            Call.created_at <= today_end,
        )
    )
    total_calls_today: int = total_calls_today_result.scalar() or 0

    # ── Assemble & Return ─────────────────────────────────────────
    return {
        "total_leads": total_leads,
        "total_contacts": total_contacts,
        "closed_deals": closed_deals,
        "total_calls": total_calls,
        "total_calls_today": total_calls_today,
        "follow_ups_today": follow_ups_today,
        "campaigns": campaigns_data,
    }
