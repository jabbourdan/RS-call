from uuid import UUID
from datetime import datetime
import asyncio

from fastapi import HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import func, cast, Date

from app.models.base import Campaign, CampaignSettings, Lead, Call, User
from app.services.org_phone_number_service import OrgPhoneNumberService


DEFAULT_STATUS_OPTIONS = {
    "statuses": [
        "ממתין",        # pending
        "ענה",          # answered
        "לא רלוונטי",   # not relevant
        "עסקה נסגרה",   # closed deal
        "פולו אפ",      # follow up
        "אל תתקשר"      # do not call
    ]
}


class CampaignService:

    # ── CREATE CAMPAIGN + AUTO CREATE SETTINGS ────────────────────────────────

    @staticmethod
    async def create_campaign(db: AsyncSession, payload, current_user: User) -> Campaign:

        # Guard: campaign name must be unique within the org
        result = await db.execute(
            select(Campaign).where(
                Campaign.name == payload.name,
                Campaign.org_id == current_user.org_id
            )
        )
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Campaign '{payload.name}' already exists in your organization.",
            )

        # Create Campaign
        campaign = Campaign(
            org_id=current_user.org_id,
            created_by=current_user.user_id,
            name=payload.name,
            description=payload.description,
            status=payload.status,
        )
        db.add(campaign)
        await db.flush()        # get campaign_id before creating settings

        # Auto-create default CampaignSettings
        settings = CampaignSettings(
            campaign_id=campaign.campaign_id,
            max_calls_to_unanswered_lead=3,
            campaign_status=DEFAULT_STATUS_OPTIONS,
        )
        db.add(settings)
        await db.commit()

        # Reload with settings relationship
        result = await db.execute(
            select(Campaign)
            .where(Campaign.campaign_id == campaign.campaign_id)
            .options(selectinload(Campaign.settings))
        )
        return result.scalars().first()

    # ── LIST CAMPAIGNS ────────────────────────────────────────────────────────

    @staticmethod
    async def list_campaigns(db: AsyncSession, current_user: User):
        result = await db.execute(
            select(Campaign)
            .where(Campaign.org_id == current_user.org_id)
            .options(selectinload(Campaign.settings))
            .order_by(Campaign.created_at.desc())
        )
        return result.scalars().all()

    # ── GET SINGLE CAMPAIGN ───────────────────────────────────────────────────

    @staticmethod
    async def get_campaign(db: AsyncSession, campaign_id: UUID, current_user: User) -> Campaign:
        result = await db.execute(
            select(Campaign)
            .where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id     # org isolation
            )
            .options(selectinload(Campaign.settings))
        )
        campaign = result.scalars().first()
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found.",
            )
        return campaign

    # ── UPDATE SETTINGS ───────────────────────────────────────────────────────

    @staticmethod
    async def update_settings(db: AsyncSession, campaign_id: UUID, payload, current_user: User) -> CampaignSettings:

        # Guard: campaign must belong to same org
        camp_result = await db.execute(
            select(Campaign).where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id
            )
        )
        if not camp_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found.",
            )

        # Get settings
        result = await db.execute(
            select(CampaignSettings).where(CampaignSettings.campaign_id == campaign_id)
        )
        settings = result.scalars().first()
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign settings not found.",
            )

        # Update only fields that were sent
        if payload.primary_phone_id is not None:
            await OrgPhoneNumberService.validate_phone_for_org(db, payload.primary_phone_id, current_user.org_id)
            settings.primary_phone_id = payload.primary_phone_id
        if payload.secondary_phone_id is not None:
            await OrgPhoneNumberService.validate_phone_for_org(db, payload.secondary_phone_id, current_user.org_id)
            settings.secondary_phone_id = payload.secondary_phone_id
        if (
            (payload.primary_phone_id or settings.primary_phone_id)
            and (payload.secondary_phone_id or settings.secondary_phone_id)
        ):
            p_id = payload.primary_phone_id or settings.primary_phone_id
            s_id = payload.secondary_phone_id or settings.secondary_phone_id
            if p_id == s_id:
                raise HTTPException(
                    status_code=400,
                    detail="Primary and secondary phone numbers must be different.",
                )
        if payload.change_number_after is not None:
            settings.change_number_after = payload.change_number_after
        if payload.max_calls_to_unanswered_lead is not None:
            settings.max_calls_to_unanswered_lead = payload.max_calls_to_unanswered_lead
        if payload.campaign_status is not None:
            settings.campaign_status = payload.campaign_status
        
        if payload.calling_algorithm is not None:

            if payload.calling_algorithm not in {"priority", "random", "sequential"}:
                raise HTTPException(
                    status_code=400,
                    detail="calling_algorithm must be one of: priority, random, sequential"
                )
            
            settings.calling_algorithm = payload.calling_algorithm

        if payload.cooldown_minutes is not None:
            settings.cooldown_minutes = payload.cooldown_minutes

        settings.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(settings)
        return settings

    # ── UPDATE CAMPAIGN ───────────────────────────────────────────────────────

    @staticmethod
    async def update_campaign(db: AsyncSession, campaign_id: UUID, payload, current_user: User) -> Campaign:

        # Guard: campaign must exist and belong to same org
        result = await db.execute(
            select(Campaign)
            .where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id
            )
            .options(selectinload(Campaign.settings))
        )
        campaign = result.scalars().first()
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found.",
            )

        # Guard: new name must not conflict with another campaign in the same org
        if payload.name is not None and payload.name != campaign.name:
            conflict = await db.execute(
                select(Campaign).where(
                    Campaign.name == payload.name,
                    Campaign.org_id == current_user.org_id,
                    Campaign.campaign_id != campaign_id,
                )
            )
            if conflict.scalars().first():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A campaign named '{payload.name}' already exists in your organization.",
                )

        # Guard: status must be a valid value
        if payload.status is not None:
            valid_statuses = {"draft", "active", "paused", "completed"}
            if payload.status not in valid_statuses:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
                )

        # Apply only the supplied fields
        if payload.name is not None:
            campaign.name = payload.name
        if payload.description is not None:
            campaign.description = payload.description
        if payload.status is not None:
            campaign.status = payload.status

        campaign.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(campaign)
        return campaign

    # ── CAMPAIGN OVERVIEW (settings + full stats) ────────────────────────────

    @staticmethod
    async def get_campaign_overview(db: AsyncSession, campaign_id: UUID, current_user: User) -> dict:

        # Guard: campaign must exist and belong to the org
        camp_result = await db.execute(
            select(Campaign)
            .where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id
            )
            .options(selectinload(Campaign.settings))
        )
        campaign = camp_result.scalars().first()
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found.",
            )

        settings = campaign.settings

        # ── Lead stats ────────────────────────────────────────────────────────
        leads_result = await db.execute(
            select(Lead).where(
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id,
            )
        )
        all_leads = leads_result.scalars().all()

        today = datetime.utcnow().date()
        stat_map = {
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
            if cur == "ממתין":          stat_map["pending"]      += 1
            elif cur == "ענה":          stat_map["answered"]     += 1
            elif cur == "לא רלוונטי":  stat_map["not_relevant"] += 1
            elif cur == "עסקה נסגרה":  stat_map["closed_deals"] += 1
            elif cur == "פולו אפ":     stat_map["follow_up"]    += 1
            elif cur == "אל תתקשר":   stat_map["do_not_call"]  += 1

        # ── Call stats ────────────────────────────────────────────────────────
        total_calls_result = await db.execute(
            select(func.count(Call.call_id)).where(
                Call.campaign_id == campaign_id,
                Call.org_id == current_user.org_id,
            )
        )
        total_calls = total_calls_result.scalar() or 0

        answered_calls_result = await db.execute(
            select(func.count(Call.call_id)).where(
                Call.campaign_id == campaign_id,
                Call.org_id == current_user.org_id,
                Call.status == "completed",
            )
        )
        answered_calls = answered_calls_result.scalar() or 0

        today_calls_result = await db.execute(
            select(func.count(Call.call_id)).where(
                Call.campaign_id == campaign_id,
                Call.org_id == current_user.org_id,
                cast(Call.created_at, Date) == today,
            )
        )
        calls_today = today_calls_result.scalar() or 0

        return {
            "campaign_id": str(campaign.campaign_id),
            "name": campaign.name,
            "description": campaign.description,
            "status": campaign.status,
            "created_at": campaign.created_at,
            "updated_at": campaign.updated_at,
            "settings": settings,
            "stats": {
                **stat_map,
                "total_calls": total_calls,
                "answered_calls": answered_calls,
                "calls_today": calls_today,
            },
        }

    # ── LIST ALL OVERVIEWS ────────────────────────────────────────────────────

    @staticmethod
    async def list_all_overviews(db: AsyncSession, current_user: User) -> list:
        """Returns settings + full stats for every campaign in the org in one shot."""
        campaigns_result = await db.execute(
            select(Campaign)
            .where(Campaign.org_id == current_user.org_id)
            .order_by(Campaign.created_at.desc())
        )
        campaigns = campaigns_result.scalars().all()

        overviews = await asyncio.gather(*[
            CampaignService.get_campaign_overview(
                db=db,
                campaign_id=campaign.campaign_id,
                current_user=current_user,
            )
            for campaign in campaigns
        ])
        return list(overviews)

    # ── DELETE CAMPAIGN ───────────────────────────────────────────────────────

    @staticmethod
    async def delete_campaign(db: AsyncSession, campaign_id: UUID, current_user: User):
        result = await db.execute(
            select(Campaign).where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id
            )
        )
        campaign = result.scalars().first()
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found.",
            )

        # Delete settings first to avoid FK constraint violation
        settings_result = await db.execute(
            select(CampaignSettings).where(CampaignSettings.campaign_id == campaign_id)
        )
        settings = settings_result.scalars().first()
        if settings:
            await db.delete(settings)
            await db.flush()    # flush settings deletion before deleting campaign

        await db.delete(campaign)
        await db.commit()
        return None