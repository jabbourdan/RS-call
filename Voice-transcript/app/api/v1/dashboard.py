from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.core.dependencies import get_current_user
from app.models.base import User
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview")
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Returns all dashboard data for the authenticated user's organisation.

    Includes:
    - total_leads: total number of leads across all campaigns
    - total_contacts: total number of contacts in the org
    - closed_deals: count of leads whose status is 'עסקה נסגרה'
    - total_calls: total calls ever made by the org
    - total_calls_today: calls made today (Israel time, UTC+2/+3)
    - follow_ups_today: leads with status 'פולו אפ' and follow_up_date == today (Israel time)
    - campaigns: list of all campaigns with name, status, and lead count
    """
    return await dashboard_service.get_overview(db=db, current_user=current_user)
