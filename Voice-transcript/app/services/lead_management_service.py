from datetime import datetime, timedelta
from uuid import UUID
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.base import Lead, Campaign, CampaignSettings, Call, User, OrgPhoneNumber

# ── Statuses that are permanently out of queue ────────────────────────────────
EXCLUDED_STATUSES = {"לא רלוונטי", "עסקה נסגרה", "אל תתקשר"}

class LeadManagementService:  # Fixed spelling: Managment -> Management

    # ── GET NEXT LEAD ─────────────────────────────────────────────────────────
    @staticmethod
    async def get_next_lead(
        db: AsyncSession,
        campaign_id: UUID,
        current_user: User,
    ) -> dict:
        # Fixed reference to self-contained helper
        camp = await LeadManagementService._get_campaign(db, campaign_id, current_user)
        settings = await LeadManagementService._get_settings(db, campaign_id)

        result = await db.execute(
            select(Lead).where(
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id,
            )
        )
        all_leads = result.scalars().all()

        now = datetime.utcnow()
        today = now.date()
        cooldown_cutoff = now - timedelta(minutes=settings.cooldown_minutes)

        eligible = []
        for lead in all_leads:
            current_status = lead.status.get("current", "ממתין") if lead.status else "ממתין"

            if current_status in EXCLUDED_STATUSES:
                continue
            if lead.tried_to_reach >= settings.max_calls_to_unanswered_lead:
                continue
            if lead.last_call_at and lead.last_call_at > cooldown_cutoff:
                continue

            if current_status == "ממתין":
                eligible.append(lead)
            elif current_status == "פולו אפ":
                if lead.follow_up_date and lead.follow_up_date.date() <= today:
                    eligible.append(lead)

        if not eligible:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No leads available to call right now."
            )

        algorithm = settings.calling_algorithm or "priority"
        if algorithm == "random":
            eligible.sort(key=lambda l: l.created_at)
        elif algorithm == "sequential":
            eligible.sort(key=lambda l: (l.tried_to_reach, l.created_at))
        else:
            def priority_key(lead):
                current_status = lead.status.get("current", "ממתין") if lead.status else "ממתין"
                is_follow_up_today = (
                    current_status == "פולו אפ"
                    and lead.follow_up_date
                    and lead.follow_up_date.date() <= today
                )
                return (0 if is_follow_up_today else 1, 0 if lead.tried_to_reach == 0 else 1, lead.tried_to_reach, lead.created_at)
            eligible.sort(key=priority_key)

        next_lead = eligible[0]

        # Fixed reference to helper
        phone_to_use = await LeadManagementService._pick_phone_number(
            db=db,
            campaign_id=campaign_id,
            settings=settings,
        )

        return {
            "lead_id": str(next_lead.lead_id),
            "name": next_lead.name,
            "phone_number": next_lead.phone_number,
            "call_from": phone_to_use,
            "tried_to_reach": next_lead.tried_to_reach,
            "status": next_lead.status,
            "leads_remaining": len(eligible),
        }

    # ── INITIATE CALL ─────────────────────────────────────────────────────────
    @staticmethod
    async def initiate_call(
        db: AsyncSession,
        campaign_id: UUID,
        lead_id: UUID,
        current_user: User,
    ) -> dict:
        # Fixed references to helpers
        lead = await LeadManagementService._get_lead(db, lead_id, campaign_id, current_user)
        settings = await LeadManagementService._get_settings(db, campaign_id)
        phone_to_use = await LeadManagementService._pick_phone_number(db, campaign_id, settings)

        lead.tried_to_reach += 1
        lead.sum_calls_performed += 1
        lead.last_call_at = datetime.utcnow()
        lead.number_called_from = phone_to_use
        lead.called_by = current_user.user_id

        call = Call(
            org_id=current_user.org_id,
            user_id=current_user.user_id,
            campaign_id=campaign_id,
            lead_id=lead_id,
            destination=lead.phone_number,
            status="initiated",
        )
        db.add(call)
        await db.commit()
        await db.refresh(call)

        return {"call_id": str(call.call_id), "status": "initiated"}

    # ── UPDATE LEAD STATUS ────────────────────────────────────────────────────
    @staticmethod
    async def update_lead_status(
        db: AsyncSession,
        campaign_id: UUID,
        lead_id: UUID,
        new_status: str,
        follow_up_date: Optional[datetime],
        current_user: User,
    ) -> dict:
        VALID_STATUSES = {"ממתין", "ענה", "לא רלוונטי", "עסקה נסגרה", "פולו אפ", "אל תתקשר"}

        if new_status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'")

        if new_status == "פולו אפ":
            if not follow_up_date:
                raise HTTPException(status_code=400, detail="follow_up_date is required for 'פולו אפ'")
            if follow_up_date.tzinfo is not None:
                follow_up_date = follow_up_date.replace(tzinfo=None)
            if follow_up_date <= datetime.utcnow():
                raise HTTPException(status_code=400, detail="Follow-up date must be in the future")
        else:
            follow_up_date = None

        # Fixed reference to helper
        lead = await LeadManagementService._get_lead(db, lead_id, campaign_id, current_user)

        lead.status = {"current": new_status, "options": list(VALID_STATUSES)}
        lead.follow_up_date = follow_up_date

        await db.commit()
        return {"lead_id": str(lead_id), "new_status": new_status}

    # ── CAMPAIGN STATS ────────────────────────────────────────────────────────
    @staticmethod
    async def get_campaign_stats(db: AsyncSession, campaign_id: UUID, current_user: User) -> dict:
        # Fixed references to helpers
        await LeadManagementService._get_campaign(db, campaign_id, current_user)
        settings = await LeadManagementService._get_settings(db, campaign_id)

        result = await db.execute(select(Lead).where(Lead.campaign_id == campaign_id, Lead.org_id == current_user.org_id))
        all_leads = result.scalars().all()
        today = datetime.utcnow().date()

        stats = {
            "total_leads": len(all_leads),
            "pending": 0,
            "answered": 0,
            "not_relevant": 0,
            "closed_deals": 0,
            "follow_up": 0,
            "do_not_call": 0,
        }
        for lead in all_leads:
            cur = lead.status.get("current", "ממתין") if lead.status else "ממתין"
            if cur == "ממתין":          stats["pending"]      += 1
            elif cur == "ענה":          stats["answered"]     += 1
            elif cur == "לא רלוונטי":  stats["not_relevant"] += 1
            elif cur == "עסקה נסגרה":  stats["closed_deals"] += 1
            elif cur == "פולו אפ":     stats["follow_up"]    += 1
            elif cur == "אל תתקשר":   stats["do_not_call"]  += 1

        return stats

    # ── HELPERS ───────────────────────────────────────────────────────────────
    @staticmethod
    async def _get_campaign(db, campaign_id, current_user):
        result = await db.execute(select(Campaign).where(Campaign.campaign_id == campaign_id, Campaign.org_id == current_user.org_id))
        res = result.scalars().first()
        if not res: raise HTTPException(status_code=404, detail="Campaign not found")
        return res

    @staticmethod
    async def _get_settings(db, campaign_id):
        result = await db.execute(select(CampaignSettings).where(CampaignSettings.campaign_id == campaign_id))
        res = result.scalars().first()
        if not res: raise HTTPException(status_code=404, detail="Settings not found")
        return res

    @staticmethod
    async def _get_lead(db, lead_id, campaign_id, current_user):
        result = await db.execute(select(Lead).where(Lead.lead_id == lead_id, Lead.campaign_id == campaign_id, Lead.org_id == current_user.org_id))
        res = result.scalars().first()
        if not res: raise HTTPException(status_code=404, detail="Lead not found")
        return res

    @staticmethod
    async def _pick_phone_number(db, campaign_id, settings) -> Optional[str]:
        if not settings.primary_phone_id:
            return None

        primary_result = await db.execute(
            select(OrgPhoneNumber).where(
                OrgPhoneNumber.phone_id == settings.primary_phone_id,
                OrgPhoneNumber.is_active == True,
            )
        )
        primary_phone = primary_result.scalars().first()
        if not primary_phone:
            return None

        if not settings.secondary_phone_id or not settings.change_number_after:
            return primary_phone.phone_number

        secondary_result = await db.execute(
            select(OrgPhoneNumber).where(
                OrgPhoneNumber.phone_id == settings.secondary_phone_id,
                OrgPhoneNumber.is_active == True,
            )
        )
        secondary_phone = secondary_result.scalars().first()
        if not secondary_phone:
            return primary_phone.phone_number

        count_result = await db.execute(
            select(func.count(Lead.lead_id)).where(
                Lead.campaign_id == campaign_id,
                Lead.number_called_from == primary_phone.phone_number,
            )
        )
        if (count_result.scalar() or 0) >= settings.change_number_after:
            return secondary_phone.phone_number
        return primary_phone.phone_number