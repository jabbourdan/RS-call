from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

from app.database import get_session
from app.core.dependencies import get_current_user
from app.models.base import User
from app.services.contact_service import ContactService

router = APIRouter(prefix="/contacts", tags=["Contacts"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ContactCreateRequest(BaseModel):
    name: str                                       # only required field
    phone_number: Optional[str] = None
    email: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None


class ContactUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None


class ContactResponse(BaseModel):
    contact_id: UUID
    org_id: UUID
    name: str
    phone_number: Optional[str]   # null when not provided
    email: Optional[str]
    extra_data: Optional[Dict[str, Any]]
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        # Convert empty string to None so the API returns null instead of ""
        if instance.phone_number == "":
            instance.phone_number = None
        return instance


class ContactUploadSummary(BaseModel):
    total_rows: int
    imported: int
    skipped: int
    errors: List[str]


# ── CREATE (manual) ───────────────────────────────────────────────────────────

@router.post("/", response_model=ContactResponse, status_code=201, summary="Create a new contact")
async def create_contact(
    payload: ContactCreateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await ContactService.create_contact(
        db=db,
        name=payload.name,
        current_user=current_user,
        phone_number=payload.phone_number,
        email=payload.email,
        extra_data=payload.extra_data,
    )


# ── PREVIEW COLUMNS ───────────────────────────────────────────────────────────

@router.post("/preview-columns", summary="Step 1 — Preview file columns before bulk upload")
async def preview_contact_columns(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a CSV or XLSX file to get its column names and sample rows.
    Use the returned columns to build a column-mapping UI before the real upload.
    """
    contents = await file.read()
    return await ContactService.preview_contact_columns(
        contents=contents,
        filename=file.filename.lower(),
    )


# ── BULK UPLOAD FROM FILE ─────────────────────────────────────────────────────

@router.post("/upload", response_model=ContactUploadSummary, status_code=201, summary="Step 2 — Bulk import contacts from CSV or XLSX")
async def upload_contacts(
    file: UploadFile = File(...),
    name_column: str = Form(...),               # required — must match a column in the file
    phone_column: Optional[str] = Form(None),   # optional
    email_column: Optional[str] = Form(None),   # optional
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Bulk import contacts from a CSV or XLSX file.

    Form fields:
    - name_column   (required) ← maps to contact.name
    - phone_column  (optional) ← maps to contact.phone_number
    - email_column  (optional) ← maps to contact.email

    All other columns are stored in extra_data automatically.
    Rows missing a name value are skipped.
    """
    phone_column = phone_column if phone_column and phone_column.strip() else None
    email_column = email_column if email_column and email_column.strip() else None

    contents = await file.read()
    return await ContactService.upload_contacts(
        db=db,
        contents=contents,
        filename=file.filename.lower(),
        name_column=name_column,
        current_user=current_user,
        phone_column=phone_column,
        email_column=email_column,
    )


# ── LIST ──────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[ContactResponse], summary="List all contacts for the org")
async def list_contacts(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await ContactService.list_contacts(db=db, current_user=current_user)


# ── GET SINGLE ────────────────────────────────────────────────────────────────

@router.get("/{contact_id}", response_model=ContactResponse, summary="Get a single contact")
async def get_contact(
    contact_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await ContactService.get_contact(
        db=db,
        contact_id=contact_id,
        current_user=current_user,
    )


# ── UPDATE ────────────────────────────────────────────────────────────────────

@router.patch("/{contact_id}", response_model=ContactResponse, summary="Update contact details (partial)")
async def update_contact(
    contact_id: UUID,
    payload: ContactUpdateRequest,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await ContactService.update_contact(
        db=db,
        contact_id=contact_id,
        current_user=current_user,
        name=payload.name,
        phone_number=payload.phone_number,
        email=payload.email,
        extra_data=payload.extra_data,
    )


# ── DELETE ────────────────────────────────────────────────────────────────────

@router.delete("/{contact_id}", summary="Delete a contact")
async def delete_contact(
    contact_id: UUID,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return await ContactService.delete_contact(
        db=db,
        contact_id=contact_id,
        current_user=current_user,
    )
