import re
from uuid import UUID
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, or_

from app.models.base import OrgPhoneNumber, Organization, CampaignSettings, Campaign


E164_REGEX = re.compile(r"^\+[1-9]\d{1,14}$")


class OrgPhoneNumberService:

    @staticmethod
    async def add_phone_number(
        db: AsyncSession,
        org_id: UUID,
        phone_number: str,
        label: Optional[str] = None,
    ) -> OrgPhoneNumber:
        if not E164_REGEX.match(phone_number):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Phone number must be in E.164 format (e.g., +972501234567).",
            )

        org_result = await db.execute(
            select(Organization).where(Organization.org_id == org_id)
        )
        org = org_result.scalars().first()
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

        count_result = await db.execute(
            select(func.count(OrgPhoneNumber.phone_id)).where(
                OrgPhoneNumber.org_id == org_id,
                OrgPhoneNumber.is_active == True,
            )
        )
        current_count = count_result.scalar() or 0
        if current_count >= org.max_phone_numbers:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Organization has reached its phone number limit ({org.max_phone_numbers}).",
            )

        dup_result = await db.execute(
            select(OrgPhoneNumber).where(
                OrgPhoneNumber.org_id == org_id,
                OrgPhoneNumber.phone_number == phone_number,
            )
        )
        if dup_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number already exists in your organization.",
            )

        phone = OrgPhoneNumber(
            org_id=org_id,
            phone_number=phone_number,
            label=label,
        )
        db.add(phone)
        await db.commit()
        await db.refresh(phone)
        return phone

    @staticmethod
    async def list_phone_numbers(
        db: AsyncSession,
        org_id: UUID,
        include_inactive: bool = False,
    ) -> list:
        query = select(OrgPhoneNumber).where(OrgPhoneNumber.org_id == org_id)
        if not include_inactive:
            query = query.where(OrgPhoneNumber.is_active == True)
        query = query.order_by(OrgPhoneNumber.created_at)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def validate_phone_for_org(
        db: AsyncSession,
        phone_id: UUID,
        org_id: UUID,
    ) -> OrgPhoneNumber:
        result = await db.execute(
            select(OrgPhoneNumber).where(
                OrgPhoneNumber.phone_id == phone_id,
                OrgPhoneNumber.org_id == org_id,
            )
        )
        phone = result.scalars().first()
        if not phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Phone number {phone_id} is not available in your organization.",
            )
        if not phone.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Phone number {phone_id} is not active.",
            )
        return phone

    @staticmethod
    async def update_phone_number(
        db: AsyncSession,
        phone_id: UUID,
        org_id: UUID,
        label: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> OrgPhoneNumber:
        result = await db.execute(
            select(OrgPhoneNumber).where(
                OrgPhoneNumber.phone_id == phone_id,
                OrgPhoneNumber.org_id == org_id,
            )
        )
        phone = result.scalars().first()
        if not phone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phone number not found.")

        if label is not None:
            phone.label = label
        if is_active is not None:
            phone.is_active = is_active

        await db.commit()
        await db.refresh(phone)
        return phone

    @staticmethod
    async def delete_phone_number(
        db: AsyncSession,
        phone_id: UUID,
        org_id: UUID,
    ) -> dict:
        result = await db.execute(
            select(OrgPhoneNumber).where(
                OrgPhoneNumber.phone_id == phone_id,
                OrgPhoneNumber.org_id == org_id,
            )
        )
        phone = result.scalars().first()
        if not phone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phone number not found.")

        phone.is_active = False
        await db.flush()

        campaign_result = await db.execute(
            select(Campaign.name).join(
                CampaignSettings, CampaignSettings.campaign_id == Campaign.campaign_id
            ).where(
                Campaign.org_id == org_id,
                or_(
                    CampaignSettings.primary_phone_id == phone_id,
                    CampaignSettings.secondary_phone_id == phone_id,
                ),
            )
        )
        campaign_names = [row[0] for row in campaign_result.all()]

        await db.commit()
        await db.refresh(phone)

        warning = None
        if campaign_names:
            names_str = ", ".join(campaign_names)
            warning = f"Phone number deactivated. Warning: used by campaigns: [{names_str}]."

        return {"phone": phone, "warning": warning}
