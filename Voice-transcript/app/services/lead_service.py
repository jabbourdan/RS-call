from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime
import pandas as pd
import re
import io

from app.models.base import Lead, Campaign, CampaignSettings, User, LeadStatusHistory


# =========================
# Phone Number Normalizer
# =========================

def normalize_israeli_phone(raw: str) -> Optional[str]:
    """
    Converts any Israeli phone number into a normalized format.
    Mobile:   05XXXXXXXX  (10 digits)
    Landline: 0XXXXXXXXX  (9 digits) — 02, 03, 04, 08, 09
    """
    if not raw:
        return None

    cleaned = re.sub(r"[\s\-\.\(\)\/]", "", str(raw).strip())

    if cleaned.startswith("+972"):
        cleaned = "0" + cleaned[4:]
    elif cleaned.startswith("972"):
        cleaned = "0" + cleaned[3:]

    cleaned = re.sub(r"\D", "", cleaned)

    if re.match(r"^5\d{8}$", cleaned):
        cleaned = "0" + cleaned

    if re.match(r"^[2348]\d{7}$", cleaned):
        cleaned = "0" + cleaned

    if re.match(r"^05\d{8}$", cleaned):
        return cleaned

    if re.match(r"^0[2348]\d{7}$", cleaned):
        return cleaned

    return None


# =========================
# LeadService
# =========================

class LeadService:

    # ── 1. PREVIEW COLUMNS ───────────────────────────────────────────────────

    @staticmethod
    async def preview_columns(contents: bytes, filename: str) -> dict:
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(contents), nrows=3)
            elif filename.endswith(".xlsx") or filename.endswith(".xls"):
                df = pd.read_excel(io.BytesIO(contents), nrows=3)
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported file format. Use .csv or .xlsx only."
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

        return {
            "columns": list(df.columns),
            "sample_rows": df.fillna("").to_dict(orient="records"),
            "total_columns": len(df.columns),
        }

    # ── 2. UPLOAD LEADS ──────────────────────────────────────────────────────

    @staticmethod
    async def upload_leads(
        db: AsyncSession,
        contents: bytes,
        filename: str,
        campaign_id: UUID,
        phone_column: str,
        name_column: Optional[str],
        email_column: Optional[str],
        current_user: User,
    ) -> dict:

        # Organization Guard: Ensure campaign exists for this org
        camp_result = await db.execute(
            select(Campaign).where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id
            )
        )
        campaign = camp_result.scalars().first()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found.")

        # Load DataFrame
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(contents))
            else:
                df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid file: {str(e)}")

        # Validation: Ensure mapping columns exist in file
        for col, col_name in [(phone_column, "phone_column"), (name_column, "name_column"), (email_column, "email_column")]:
            if col and col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{col}' ({col_name}) not found in file.")

        mapped_columns = {phone_column, name_column, email_column} - {None}

        # Get Campaign specific status options
        settings_result = await db.execute(
            select(CampaignSettings).where(CampaignSettings.campaign_id == campaign_id)
        )
        settings = settings_result.scalars().first()
        status_options = ["ממתין", "ענה", "לא רלוונטי", "עסקה נסגרה", "פולו אפ", "אל תתקשר"]
        if settings and settings.campaign_status:
            status_options = settings.campaign_status.get("statuses", status_options)

        # Processing loop
        total_rows, imported, skipped, failed = len(df), 0, 0, 0
        errors = []

        for index, row in df.iterrows():
            row_num = index + 2
            raw_phone = str(row.get(phone_column, "")).strip()
            
            phone_number = normalize_israeli_phone(raw_phone)
            if not phone_number:
                errors.append(f"Row {row_num}: Invalid phone '{raw_phone}'")
                failed += 1
                continue

            # Duplicate Check within campaign
            dup = await db.execute(select(Lead).where(Lead.phone_number == phone_number, Lead.campaign_id == campaign_id))
            if dup.scalars().first():
                skipped += 1
                continue

            # Build extra_data (non-mapped columns)
            extra_data = {col: row[col] for col in df.columns if col not in mapped_columns and pd.notna(row[col])}

            lead = Lead(
                org_id=current_user.org_id,
                campaign_id=campaign_id,
                campaign_name=campaign.name,
                phone_number=phone_number,
                name=str(row.get(name_column)).strip() if name_column and pd.notna(row.get(name_column)) else None,
                email=str(row.get(email_column)).strip() if email_column and pd.notna(row.get(email_column)) else None,
                created_by=current_user.user_id,
                extra_data=extra_data if extra_data else None,
                status={"current": "ממתין", "options": status_options}
            )
            db.add(lead)
            imported += 1

        await db.commit()
        return {
            "total_rows": total_rows,
            "imported": imported,
            "skipped_duplicates": skipped,
            "failed_invalid": failed,
            "errors": errors[:50]  # Limit error list
        }

    # ── 3. CREATE LEAD MANUALLY ──────────────────────────────────────────────

    @staticmethod
    async def create_lead_manual(
        db: AsyncSession,
        campaign_id: UUID,
        phone_number: str,
        current_user: User,
        name: Optional[str] = None,
        email: Optional[str] = None,
        extra_data: Optional[Dict] = None,
    ) -> Lead:
        # ── Org + campaign guard ──────────────────────────────────
        camp_result = await db.execute(
            select(Campaign).where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id,
            )
        )
        campaign = camp_result.scalars().first()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found.")

        # ── Normalize phone ───────────────────────────────────────
        normalized = normalize_israeli_phone(phone_number)
        if not normalized:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid Israeli phone number: '{phone_number}'",
            )

        # ── Duplicate check within campaign ──────────────────────
        dup = await db.execute(
            select(Lead).where(
                Lead.phone_number == normalized,
                Lead.campaign_id == campaign_id,
            )
        )
        if dup.scalars().first():
            raise HTTPException(
                status_code=409,
                detail=f"A lead with phone '{normalized}' already exists in this campaign.",
            )

        # ── Get campaign status options ───────────────────────────
        settings_result = await db.execute(
            select(CampaignSettings).where(CampaignSettings.campaign_id == campaign_id)
        )
        settings = settings_result.scalars().first()
        status_options = ["ממתין", "ענה", "לא רלוונטי", "עסקה נסגרה", "פולו אפ", "אל תתקשר"]
        if settings and settings.campaign_status:
            status_options = settings.campaign_status.get("statuses", status_options)

        lead = Lead(
            org_id=current_user.org_id,
            campaign_id=campaign_id,
            campaign_name=campaign.name,
            phone_number=normalized,
            name=name,
            email=email,
            created_by=current_user.user_id,
            extra_data=extra_data,
            status={"current": "ממתין", "options": status_options},
        )
        db.add(lead)
        await db.commit()
        await db.refresh(lead)
        return lead

    # ── 4. LIST LEADS ────────────────────────────────────────────────────────

    @staticmethod
    async def list_leads(db: AsyncSession, campaign_id: UUID, current_user: User) -> list:
        result = await db.execute(
            select(Lead)
            .where(Lead.campaign_id == campaign_id, Lead.org_id == current_user.org_id)
            .order_by(Lead.created_at.asc())
        )
        return result.scalars().all()

    # ── 5. UPDATE LEAD STATUS ────────────────────────────────────────────────

    @staticmethod
    async def update_lead_status(
        db: AsyncSession,
        campaign_id: UUID,
        lead_id: UUID,
        new_status: str,
        follow_up_date: Optional[datetime],
        current_user: User,
        comment: Optional[str] = None,
    ) -> dict:

        VALID_STATUSES = {"ממתין", "ענה", "לא רלוונטי", "עסקה נסגרה", "פולו אפ", "אל תתקשר"}

        # 1. Basic Status Validation
        if new_status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'")

        # 2. Follow-up Logic & Future Date Validation
        if new_status == "פולו אפ":
            if not follow_up_date:
                raise HTTPException(status_code=400, detail="follow_up_date is required for 'פולו אפ'")
            
            # Fix: Ensure follow_up_date is offset-naive to match DB (strips timezone)
            if follow_up_date.tzinfo is not None:
                follow_up_date = follow_up_date.replace(tzinfo=None)
            
            # Validation: Date must be in the future
            if follow_up_date <= datetime.utcnow():
                raise HTTPException(
                    status_code=400, 
                    detail="Follow-up date must be in the future (תאריך פולו-אפ חייב להיות עתידי)"
                )
        else:
            follow_up_date = None

        # 3. Fetch Lead
        result = await db.execute(
            select(Lead).where(
                Lead.lead_id == lead_id,
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id,
            )
        )
        lead = result.scalars().first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found.")

        old_status = lead.status.get("current", "") if lead.status else ""

        # 4. Update
        lead.status = {
            "current": new_status,
            "options": list(VALID_STATUSES)
        }
        lead.follow_up_date = follow_up_date

        # 5. Auto-log status change to LeadStatusHistory
        history = LeadStatusHistory(
            lead_id=lead.lead_id,
            org_id=lead.org_id,
            user_id=current_user.user_id,
            old_status=old_status,
            new_status=new_status,
            follow_up_date=follow_up_date if new_status == "פולו אפ" else None,
            comment=comment,
        )
        db.add(history)

        try:
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        return {
            "lead_id": str(lead_id),
            "name": lead.name,
            "old_status": old_status,
            "new_status": new_status,
            "follow_up_date": lead.follow_up_date,
            "updated_at": datetime.utcnow(),
        }

    # ── 6. DELETE LEAD ───────────────────────────────────────────────────────

    @staticmethod
    async def delete_lead(db: AsyncSession, campaign_id: UUID, lead_id: UUID, current_user: User) -> dict:
        result = await db.execute(
            select(Lead).where(
                Lead.lead_id == lead_id,
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id
            )
        )
        lead = result.scalars().first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found.")

        await db.delete(lead)
        await db.commit()
        return {"status": "deleted", "lead_id": str(lead_id)}

    # ── 7. UPDATE LEAD ───────────────────────────────────────────────────────

    @staticmethod
    async def update_lead(
        db: AsyncSession,
        campaign_id: UUID,
        lead_id: UUID,
        current_user: User,
        phone_number: Optional[str] = None,
        name: Optional[str] = None,
        email: Optional[str] = None,
        extra_data: Optional[Dict] = None,
    ) -> Lead:
        # ── Fetch lead with org + campaign guard ──────────────────
        result = await db.execute(
            select(Lead).where(
                Lead.lead_id == lead_id,
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id,
            )
        )
        lead = result.scalars().first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found.")

        # ── Update phone_number if provided ───────────────────────
        if phone_number is not None:
            normalized = normalize_israeli_phone(phone_number)
            if not normalized:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid Israeli phone number: '{phone_number}'",
                )
            # Duplicate check within campaign (exclude current lead)
            dup = await db.execute(
                select(Lead).where(
                    Lead.phone_number == normalized,
                    Lead.campaign_id == campaign_id,
                    Lead.lead_id != lead_id,
                )
            )
            if dup.scalars().first():
                raise HTTPException(
                    status_code=409,
                    detail=f"A lead with phone '{normalized}' already exists in this campaign.",
                )
            lead.phone_number = normalized

        # ── Update remaining fields if provided ───────────────────
        if name is not None:
            lead.name = name
        if email is not None:
            lead.email = email
        if extra_data is not None:
            lead.extra_data = extra_data

        try:
            await db.commit()
            await db.refresh(lead)
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        return lead