from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
import re

from app.database import get_session
from app.core.dependencies import get_current_user, require_admin
from app.models.base import User, Organization
from app.services.org_phone_number_service import OrgPhoneNumberService
from sqlalchemy.future import select

router = APIRouter(prefix="/organizations", tags=["Organization Phone Numbers"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class PhoneNumberCreateRequest(BaseModel):
    phone_number: str
    label: Optional[str] = None

    @field_validator("phone_number")
    @classmethod
    def validate_e164(cls, v: str) -> str:
        if not re.match(r"^\+[1-9]\d{1,14}$", v):
            raise ValueError("Phone number must be in E.164 format (e.g., +972501234567).")
        return v


class PhoneNumberUpdateRequest(BaseModel):
    label: Optional[str] = None
    is_active: Optional[bool] = None


class PhoneNumberResponse(BaseModel):
    phone_id: UUID
    org_id: UUID
    phone_number: str
    label: Optional[str]
    is_active: bool
    created_at: datetime
    warning: Optional[str] = None
    model_config = {"from_attributes": True}


class OrgUpdateRequest(BaseModel):
    max_phone_numbers: int


class OrgUpdateResponse(BaseModel):
    org_id: UUID
    org_name: str
    max_phone_numbers: int
    model_config = {"from_attributes": True}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/phone-numbers", response_model=PhoneNumberResponse, status_code=201)
async def add_phone_number(
    payload: PhoneNumberCreateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    phone = await OrgPhoneNumberService.add_phone_number(
        db=db,
        org_id=current_user.org_id,
        phone_number=payload.phone_number,
        label=payload.label,
    )
    return phone


@router.get("/phone-numbers", response_model=list[PhoneNumberResponse])
async def list_phone_numbers(
    include_inactive: bool = Query(False),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await OrgPhoneNumberService.list_phone_numbers(
        db=db,
        org_id=current_user.org_id,
        include_inactive=include_inactive,
    )


@router.patch("/phone-numbers/{phone_id}", response_model=PhoneNumberResponse)
async def update_phone_number(
    phone_id: UUID,
    payload: PhoneNumberUpdateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    return await OrgPhoneNumberService.update_phone_number(
        db=db,
        phone_id=phone_id,
        org_id=current_user.org_id,
        label=payload.label,
        is_active=payload.is_active,
    )


@router.delete("/phone-numbers/{phone_id}", response_model=PhoneNumberResponse)
async def delete_phone_number(
    phone_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    result = await OrgPhoneNumberService.delete_phone_number(
        db=db,
        phone_id=phone_id,
        org_id=current_user.org_id,
    )
    phone = result["phone"]
    return PhoneNumberResponse(
        phone_id=phone.phone_id,
        org_id=phone.org_id,
        phone_number=phone.phone_number,
        label=phone.label,
        is_active=phone.is_active,
        created_at=phone.created_at,
        warning=result["warning"],
    )


@router.patch("/settings", response_model=OrgUpdateResponse)
async def update_org_settings(
    payload: OrgUpdateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(
        select(Organization).where(Organization.org_id == current_user.org_id)
    )
    org = result.scalars().first()
    org.max_phone_numbers = payload.max_phone_numbers
    await db.commit()
    await db.refresh(org)
    return org
