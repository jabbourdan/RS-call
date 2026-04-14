from uuid import UUID
from typing import Optional, List
import pandas as pd
import io

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.base import Contact, User


class ContactService:

    # ── CREATE ────────────────────────────────────────────────────────────────

    @staticmethod
    async def create_contact(
        db: AsyncSession,
        name: str,
        current_user: User,
        phone_number: Optional[str] = None,
        email: Optional[str] = None,
        extra_data: Optional[dict] = None,
    ) -> Contact:
        contact = Contact(
            org_id=current_user.org_id,
            name=name,
            phone_number=phone_number or "",
            email=email,
            extra_data=extra_data,
        )
        db.add(contact)
        await db.commit()
        await db.refresh(contact)
        return contact

    # ── PREVIEW COLUMNS ───────────────────────────────────────────────────────

    @staticmethod
    async def preview_contact_columns(contents: bytes, filename: str) -> dict:
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(contents), nrows=3)
            elif filename.endswith(".xlsx") or filename.endswith(".xls"):
                df = pd.read_excel(io.BytesIO(contents), nrows=3)
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported file format. Use .csv or .xlsx only.",
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

    # ── UPLOAD FROM FILE (CSV / XLSX) ─────────────────────────────────────────

    @staticmethod
    async def upload_contacts(
        db: AsyncSession,
        contents: bytes,
        filename: str,
        name_column: str,
        current_user: User,
        phone_column: Optional[str] = None,
        email_column: Optional[str] = None,
    ) -> dict:
        # ── Parse file ────────────────────────────────────────────
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(contents))
            elif filename.endswith(".xlsx") or filename.endswith(".xls"):
                df = pd.read_excel(io.BytesIO(contents))
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported file format. Use .csv or .xlsx only.",
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

        # ── Validate columns exist ────────────────────────────────
        for col, label in [
            (name_column,  "name_column"),
            (phone_column, "phone_column"),
            (email_column, "email_column"),
        ]:
            if col and col not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Column '{col}' ({label}) not found in file.",
                )

        mapped_columns = {name_column, phone_column, email_column} - {None}

        total_rows = len(df)
        imported = 0
        skipped = 0
        errors: List[str] = []

        for index, row in df.iterrows():
            row_num = index + 2

            raw_name = str(row.get(name_column, "")).strip() if name_column else ""
            if not raw_name or raw_name.lower() == "nan":
                errors.append(f"Row {row_num}: missing name — skipped")
                skipped += 1
                continue

            phone = (
                str(row.get(phone_column, "")).strip()
                if phone_column and pd.notna(row.get(phone_column))
                else ""
            )
            email = (
                str(row.get(email_column, "")).strip()
                if email_column and pd.notna(row.get(email_column))
                else None
            )

            extra_data = {
                col: row[col]
                for col in df.columns
                if col not in mapped_columns and pd.notna(row[col])
            }

            contact = Contact(
                org_id=current_user.org_id,
                name=raw_name,
                phone_number=phone,
                email=email,
                extra_data=extra_data if extra_data else None,
            )
            db.add(contact)
            imported += 1

        await db.commit()
        return {
            "total_rows": total_rows,
            "imported": imported,
            "skipped": skipped,
            "errors": errors[:50],
        }

    # ── LIST ──────────────────────────────────────────────────────────────────

    @staticmethod
    async def list_contacts(
        db: AsyncSession,
        current_user: User,
    ) -> List[Contact]:
        result = await db.execute(
            select(Contact)
            .where(Contact.org_id == current_user.org_id)
            .order_by(Contact.created_at.asc())
        )
        return result.scalars().all()

    # ── GET SINGLE ────────────────────────────────────────────────────────────

    @staticmethod
    async def get_contact(
        db: AsyncSession,
        contact_id: UUID,
        current_user: User,
    ) -> Contact:
        result = await db.execute(
            select(Contact).where(
                Contact.contact_id == contact_id,
                Contact.org_id == current_user.org_id,
            )
        )
        contact = result.scalars().first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found.")
        return contact

    # ── UPDATE ────────────────────────────────────────────────────────────────

    @staticmethod
    async def update_contact(
        db: AsyncSession,
        contact_id: UUID,
        current_user: User,
        name: Optional[str] = None,
        phone_number: Optional[str] = None,
        email: Optional[str] = None,
        extra_data: Optional[dict] = None,
    ) -> Contact:
        result = await db.execute(
            select(Contact).where(
                Contact.contact_id == contact_id,
                Contact.org_id == current_user.org_id,
            )
        )
        contact = result.scalars().first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found.")

        if name is not None:
            contact.name = name
        if phone_number is not None:
            contact.phone_number = phone_number
        if email is not None:
            contact.email = email
        if extra_data is not None:
            contact.extra_data = extra_data

        await db.commit()
        await db.refresh(contact)
        return contact

    # ── DELETE ────────────────────────────────────────────────────────────────

    @staticmethod
    async def delete_contact(
        db: AsyncSession,
        contact_id: UUID,
        current_user: User,
    ) -> dict:
        result = await db.execute(
            select(Contact).where(
                Contact.contact_id == contact_id,
                Contact.org_id == current_user.org_id,
            )
        )
        contact = result.scalars().first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found.")

        await db.delete(contact)
        await db.commit()
        return {"status": "deleted", "contact_id": str(contact_id)}
