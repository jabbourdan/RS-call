from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.database import get_session
from app.core.dependencies import get_current_user, require_admin
from app.models.base import User
from app.services.lead_management_service import LeadManagementService
from app.services.lead_service import LeadService
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/lead_management", tags=["lead_management"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class InitiateCallRequest(BaseModel):
    lead_id: UUID


class UpdateLeadStatusRequest(BaseModel):
    status: str                             
    follow_up_date: Optional[datetime] = None  # required only when status = פולו אפ
    comment: Optional[str] = None              # optional note about the status change


class AddCommentRequest(BaseModel):
    content: str


# ── GET NEXT LEAD ─────────────────────────────────────────────────────────────

@router.get("/{campaign_id}/next-lead")
async def get_next_lead(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any agent
):
    """
    Returns the next lead to call based on the campaign algorithm.
    Also returns which phone number to call from.
    """
    return await LeadManagementService.get_next_lead(
        db=db,
        campaign_id=campaign_id,
        current_user=current_user,
    )


# ── INITIATE CALL ─────────────────────────────────────────────────────────────

@router.post("/{campaign_id}/initiate", status_code=201)
async def initiate_call(
    campaign_id: UUID,
    payload: InitiateCallRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any agent
):
    """
    Records the call initiation and updates lead tracking.
    Returns the number to dial and which number to call from.
    """
    return await LeadManagementService.initiate_call(
        db=db,
        campaign_id=campaign_id,
        lead_id=payload.lead_id,
        current_user=current_user,
    )


# ── UPDATE LEAD STATUS ────────────────────────────────────────────────────────


@router.patch("/{campaign_id}/leads/{lead_id}/status", summary="Update lead status and follow up date")
async def update_lead_status(
    campaign_id: UUID,
    lead_id: UUID,
    payload: UpdateLeadStatusRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any agent
):
    """
    Updates the status of a lead.
    Valid statuses: ממתין | ענה | לא רלוונטי | עסקה נסגרה | פולו אפ | אל תתקשר
    If status = פולו אפ → follow_up_date is required.
    """
    return await LeadService.update_lead_status(
        db=db,
        campaign_id=campaign_id,
        lead_id=lead_id,
        new_status=payload.status,
        follow_up_date=payload.follow_up_date,
        current_user=current_user,
        comment=payload.comment,
    )


# ── DELETE LEAD ───────────────────────────────────────────────────

@router.delete("/{campaign_id}/leads/{lead_id}", summary="Delete a lead")
async def delete_lead(
    campaign_id: UUID,
    lead_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await LeadService.delete_lead(
        db=db,
        campaign_id=campaign_id,
        lead_id=lead_id,
        current_user=current_user,
    )


# ── CAMPAIGN STATS ────────────────────────────────────────────────────────────

@router.get("/{campaign_id}/stats")
async def get_campaign_stats(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any logged in user
):
    """
    Returns live campaign statistics computed from leads.
    """
    return await LeadManagementService.get_campaign_stats(
        db=db,
        campaign_id=campaign_id,
        current_user=current_user,
    )


# ── ADD COMMENT ───────────────────────────────────────────────────────────────

@router.post("/{lead_id}/comments", status_code=201, summary="Add a permanent comment to a lead")
async def add_comment(
    lead_id: UUID,
    payload: AddCommentRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any agent
):
    """
    Adds a permanent comment to a lead. Comments cannot be edited or deleted.
    """
    return await TimelineService.add_comment(
        db=db,
        lead_id=lead_id,
        content=payload.content,
        current_user=current_user,
    )


# ── SIMPLE TIMELINE ──────────────────────────────────────────────────────────

@router.get("/{lead_id}/timeline", summary="Get lightweight lead timeline")
async def get_timeline(
    lead_id: UUID,
    page: int = 1,
    page_size: int = 50,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any agent
):
    """
    Returns a lightweight timeline of all lead events, sorted newest first.
    Optional filter: type = call | ai_summary | comment | status_change | lead_created
    """
    return await TimelineService.get_timeline(
        db=db,
        lead_id=lead_id,
        current_user=current_user,
        page=page,
        page_size=page_size,
        event_type=type,
    )


# ── FULL TIMELINE ────────────────────────────────────────────────────────────

@router.get("/{lead_id}/timeline/full", summary="Get full lead timeline with lead summary")
async def get_timeline_full(
    lead_id: UUID,
    page: int = 1,
    page_size: int = 50,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any agent
):
    """
    Returns the full timeline with complete nested data and a lead_summary header.
    Optional filter: type = call | ai_summary | comment | status_change | lead_created
    """
    return await TimelineService.get_timeline_full(
        db=db,
        lead_id=lead_id,
        current_user=current_user,
        page=page,
        page_size=page_size,
        event_type=type,
    )