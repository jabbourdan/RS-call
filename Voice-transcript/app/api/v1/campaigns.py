from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, Field, model_validator
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

#services
from app.services.campaign_service import CampaignService

from app.database import get_session
from app.core.dependencies import get_current_user, require_admin
from app.models.base import Campaign, CampaignSettings, User, OrgPhoneNumber

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CampaignCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = "active"


class CampaignSettingsResponse(BaseModel):
    settings_id: UUID
    campaign_id: UUID
    primary_phone_id: Optional[UUID]
    secondary_phone_id: Optional[UUID]
    primary_phone_number: Optional[str] = None
    secondary_phone_number: Optional[str] = None
    change_number_after: Optional[int]
    max_calls_to_unanswered_lead: int
    calling_algorithm: str
    cooldown_minutes: int
    campaign_status: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class CampaignResponse(BaseModel):
    campaign_id: UUID
    org_id: UUID
    created_by: UUID
    name: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    settings: Optional[CampaignSettingsResponse]
    model_config = {"from_attributes": True}


class CampaignSettingsUpdateRequest(BaseModel):
    primary_phone_id: Optional[UUID] = None
    secondary_phone_id: Optional[UUID] = None
    change_number_after: Optional[int] = Field(default=None, ge=1)
    max_calls_to_unanswered_lead: Optional[int] = Field(default=None, ge=1)
    calling_algorithm: Optional[str] = None
    cooldown_minutes: Optional[int] = Field(default=None, ge=0)
    campaign_status: Optional[Dict[str, Any]] = None


class CampaignUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    model_config = {"from_attributes": True}


class CampaignStatsResponse(BaseModel):
    total_leads: int
    pending: int
    answered: int
    not_relevant: int
    closed_deals: int
    follow_up: int
    do_not_call: int
    total_calls: int
    answered_calls: int
    calls_today: int


class CampaignOverviewResponse(BaseModel):
    campaign_id: UUID
    name: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    settings: Optional[CampaignSettingsResponse]
    stats: CampaignStatsResponse
    model_config = {"from_attributes": True}


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _enrich_settings_response(db: AsyncSession, settings: CampaignSettings) -> CampaignSettingsResponse:
    primary_number = None
    secondary_number = None
    if settings.primary_phone_id:
        result = await db.execute(select(OrgPhoneNumber).where(OrgPhoneNumber.phone_id == settings.primary_phone_id))
        phone = result.scalars().first()
        if phone:
            primary_number = phone.phone_number
    if settings.secondary_phone_id:
        result = await db.execute(select(OrgPhoneNumber).where(OrgPhoneNumber.phone_id == settings.secondary_phone_id))
        phone = result.scalars().first()
        if phone:
            secondary_number = phone.phone_number
    return CampaignSettingsResponse(
        settings_id=settings.settings_id,
        campaign_id=settings.campaign_id,
        primary_phone_id=settings.primary_phone_id,
        secondary_phone_id=settings.secondary_phone_id,
        primary_phone_number=primary_number,
        secondary_phone_number=secondary_number,
        change_number_after=settings.change_number_after,
        max_calls_to_unanswered_lead=settings.max_calls_to_unanswered_lead,
        calling_algorithm=settings.calling_algorithm,
        cooldown_minutes=settings.cooldown_minutes,
        campaign_status=settings.campaign_status,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    payload: CampaignCreateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),    # 🔒 any logged in user
):
    return await CampaignService.create_campaign(db=db, payload=payload, current_user=current_user)


@router.get("/", response_model=list[CampaignResponse])
async def list_campaigns(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),  # 🔒 any logged in user
):
    return await CampaignService.list_campaigns(db=db, current_user=current_user)


@router.get("/all-overviews", response_model=list[CampaignOverviewResponse])
async def list_all_campaign_overviews(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),    # 🔒 any logged in user
):
    """Returns settings + full stats for every campaign in the org — one request, no loops needed."""
    return await CampaignService.list_all_overviews(db=db, current_user=current_user)


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await CampaignService.get_campaign(db=db, campaign_id=campaign_id, current_user=current_user)


@router.get("/{campaign_id}/overview", response_model=CampaignOverviewResponse)
async def get_campaign_overview(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),    # 🔒 any logged in user
):
    """Returns campaign settings + full lead & call statistics in a single request."""
    return await CampaignService.get_campaign_overview(db=db, campaign_id=campaign_id, current_user=current_user)


@router.patch("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: UUID,
    payload: CampaignUpdateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),    # 🔒 any logged in user
):
    return await CampaignService.update_campaign(db=db, campaign_id=campaign_id, payload=payload, current_user=current_user)


@router.patch("/{campaign_id}/settings", response_model=CampaignSettingsResponse)
async def update_campaign_settings(
    campaign_id: UUID,
    payload: CampaignSettingsUpdateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),    # 🔒 any logged in user
):
    settings = await CampaignService.update_settings(db=db, campaign_id=campaign_id, payload=payload, current_user=current_user)
    return await _enrich_settings_response(db, settings)


@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),    # 🔒 any logged in user
):
    return await CampaignService.delete_campaign(db=db, campaign_id=campaign_id, current_user=current_user)