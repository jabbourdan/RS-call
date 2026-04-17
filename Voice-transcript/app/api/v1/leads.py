from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

from app.database import get_session
from app.core.dependencies import get_current_user, require_admin
from app.models.base import User
from app.services.lead_service import LeadService

router = APIRouter(prefix="/leads", tags=["Leads"])

class UpdateLeadStatusRequest(BaseModel):
    status: str
    follow_up_date: Optional[datetime] = None


# ── Schemas ───────────────────────────────────────────────────────────────────

class UploadSummary(BaseModel):
    total_rows: int
    imported: int
    skipped_duplicates: int
    failed_invalid: int
    errors: List[str]

class UpdateLeadStatusRequest(BaseModel):
    status: str
    follow_up_date: Optional[datetime] = None  # required only when status = פולו אפ

class LeadCreateRequest(BaseModel):
    phone_number: str                           # required — normalized to Israeli format
    name: Optional[str] = None
    email: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None

class LeadUpdateRequest(BaseModel):
    phone_number: Optional[str] = None          # will be normalized to Israeli format
    name: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    extra_data: Optional[Dict[str, Any]] = None

class LeadResponse(BaseModel):
    lead_id: UUID
    campaign_id: UUID
    org_id: UUID
    phone_number: str
    name: Optional[str]
    email: Optional[str]
    status: Optional[Dict[str, Any]]
    extra_data: Optional[Dict[str, Any]]
    tried_to_reach: int
    sum_calls_performed: int
    last_call_at: Optional[datetime]
    follow_up_date: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}



# ── PREVIEW COLUMNS ───────────────────────────────────────────────────────────

@router.post("/{campaign_id}/preview-columns")
async def preview_columns(
    campaign_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),     # 🔒 any logged in user
):
    """
    Step 1 — Upload file to see available columns before the real upload.
    Frontend uses this to show a column-picker UI.
    """
    contents = await file.read()
    return await LeadService.preview_columns(
        contents=contents,
        filename=file.filename.lower()
    )


# ── UPLOAD LEADS ──────────────────────────────────────────────────────────────

@router.post("/{campaign_id}/upload", response_model=UploadSummary, status_code=201)
async def upload_leads(
    campaign_id: UUID,
    file: UploadFile = File(...),
    phone_column: str = Form(...),                          # required
    name_column: Optional[str] = Form(None),                # optional
    email_column: Optional[str] = Form(None),               # optional
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),            # 🔒 owner or admin
):
    """
    Step 2 — Upload leads with column mapping.

    Form fields:
    - phone_column  (required) ← must match a column in the file
    - name_column   (optional) ← maps to lead.name
    - email_column  (optional) ← maps to lead.email

    All other columns go into extra_data JSON automatically.
    """
    
    # ── Treat empty string as None ────────────────────────────────
    name_column = name_column if name_column and name_column.strip() else None
    email_column = email_column if email_column and email_column.strip() else None

    contents = await file.read()
    return await LeadService.upload_leads(
        db=db,
        contents=contents,
        filename=file.filename.lower(),
        campaign_id=campaign_id,
        phone_column=phone_column,
        name_column=name_column,
        email_column=email_column,
        current_user=current_user,
    )


# ── CREATE LEAD MANUALLY ─────────────────────────────────────────────────────

@router.post("/{campaign_id}/create", response_model=LeadResponse, status_code=201, summary="Manually add a single lead to a campaign")
async def create_lead_manual(
    campaign_id: UUID,
    payload: LeadCreateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any logged in user
):
    """
    Add a single lead without a file upload.
    - phone_number is required and automatically normalized to Israeli format.
    - Returns 400 if the phone number is invalid.
    - Returns 409 if a lead with the same phone already exists in this campaign.
    """
    return await LeadService.create_lead_manual(
        db=db,
        campaign_id=campaign_id,
        phone_number=payload.phone_number,
        current_user=current_user,
        name=payload.name,
        email=payload.email,
        extra_data=payload.extra_data,
    )


# ── LIST LEADS ────────────────────────────────────────────────────────────────

@router.get("/{campaign_id}", status_code=200)
async def list_leads(
    campaign_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),         # 🔒 any logged in user
):
    """
    Returns all leads for a campaign ordered by creation date.
    """
    return await LeadService.list_leads(
        db=db,
        campaign_id=campaign_id,
        current_user=current_user
    )


# ── UPDATE LEAD ───────────────────────────────────────────────────────────────

@router.patch("/{campaign_id}/{lead_id}", response_model=LeadResponse, status_code=200, summary="Partially update a lead's fields")
async def update_lead(
    campaign_id: UUID,
    lead_id: UUID,
    payload: LeadUpdateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any logged in user
):
    """
    Partially update a lead's fields (phone, name, email, extra_data).
    - Only the fields you provide will be changed.
    - If phone_number is provided, it will be normalized to Israeli format.
    - Returns 400 if the new phone number is invalid.
    - Returns 409 if the new phone number already exists in this campaign.
    - Returns 404 if the lead is not found.
    """
    return await LeadService.update_lead(
        db=db,
        campaign_id=campaign_id,
        lead_id=lead_id,
        current_user=current_user,
        phone_number=payload.phone_number,
        name=payload.name,
        email=payload.email,
        status=payload.status,
        follow_up_date=payload.follow_up_date,
        extra_data=payload.extra_data,
    )


# ── DELETE LEAD ───────────────────────────────────────────────────────────────

@router.delete("/{campaign_id}/{lead_id}", status_code=200, summary="Delete a lead from a campaign")
async def delete_lead(
    campaign_id: UUID,
    lead_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),     # 🔒 any logged in user
):
    """
    Permanently delete a lead from a campaign.
    - Returns 404 if the lead is not found.
    """
    return await LeadService.delete_lead(
        db=db,
        campaign_id=campaign_id,
        lead_id=lead_id,
        current_user=current_user,
    )
