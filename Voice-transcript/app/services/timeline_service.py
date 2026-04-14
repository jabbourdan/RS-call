from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List, Dict, Any

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.models.base import (
    Lead, Call, CallAnalysis, LeadComment, LeadStatusHistory,
    User, Campaign,
)


class TimelineService:

    # ── ADD COMMENT ───────────────────────────────────────────────────────────

    @staticmethod
    async def add_comment(
        db: AsyncSession,
        lead_id: UUID,
        content: str,
        current_user: User,
    ) -> dict:
        # Verify lead exists and belongs to user's org
        result = await db.execute(
            select(Lead).where(
                Lead.lead_id == lead_id,
                Lead.org_id == current_user.org_id,
            )
        )
        lead = result.scalars().first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found.")

        comment = LeadComment(
            lead_id=lead_id,
            org_id=current_user.org_id,
            user_id=current_user.user_id,
            content=content,
        )
        db.add(comment)
        await db.commit()
        await db.refresh(comment)

        return {
            "comment_id": str(comment.comment_id),
            "lead_id": str(comment.lead_id),
            "user_id": str(comment.user_id),
            "agent_name": current_user.full_name,
            "content": comment.content,
            "created_at": comment.created_at.isoformat(),
        }

    # ── SIMPLE TIMELINE ──────────────────────────────────────────────────────

    @staticmethod
    async def get_timeline(
        db: AsyncSession,
        lead_id: UUID,
        current_user: User,
        page: int = 1,
        page_size: int = 50,
        event_type: Optional[str] = None,
    ) -> dict:
        lead = await TimelineService._get_lead(db, lead_id, current_user)
        events = await TimelineService._collect_events(
            db, lead, full=False, event_type=event_type,
        )

        total_events = len(events)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = events[start:end]

        return {
            "lead_id": str(lead_id),
            "total_events": total_events,
            "page": page,
            "page_size": page_size,
            "events": paginated,
        }

    # ── FULL TIMELINE ────────────────────────────────────────────────────────

    @staticmethod
    async def get_timeline_full(
        db: AsyncSession,
        lead_id: UUID,
        current_user: User,
        page: int = 1,
        page_size: int = 50,
        event_type: Optional[str] = None,
    ) -> dict:
        lead = await TimelineService._get_lead(db, lead_id, current_user)
        events = await TimelineService._collect_events(
            db, lead, full=True, event_type=event_type,
        )

        total_events = len(events)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = events[start:end]

        # Build lead_summary
        creator = await TimelineService._get_user(db, lead.created_by)
        lead_summary = {
            "name": lead.name,
            "phone_number": lead.phone_number,
            "campaign_name": lead.campaign_name,
            "campaign_id": str(lead.campaign_id),
            "current_status": lead.status.get("current", "") if lead.status else "",
            "follow_up_date": lead.follow_up_date.isoformat() if lead.follow_up_date else None,
            "total_calls": lead.sum_calls_performed,
            "last_call_at": lead.last_call_at.isoformat() if lead.last_call_at else None,
            "created_at": lead.created_at.isoformat(),
            "created_by": creator.full_name if creator else "Unknown",
            "extra_data": lead.extra_data,
        }

        return {
            "lead_id": str(lead_id),
            "total_events": total_events,
            "page": page,
            "page_size": page_size,
            "lead_summary": lead_summary,
            "events": paginated,
        }

    # ── INTERNAL HELPERS ─────────────────────────────────────────────────────

    @staticmethod
    async def _get_lead(db: AsyncSession, lead_id: UUID, current_user: User) -> Lead:
        result = await db.execute(
            select(Lead).where(
                Lead.lead_id == lead_id,
                Lead.org_id == current_user.org_id,
            )
        )
        lead = result.scalars().first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found.")
        return lead

    @staticmethod
    async def _get_user(db: AsyncSession, user_id: UUID) -> Optional[User]:
        result = await db.execute(select(User).where(User.user_id == user_id))
        return result.scalars().first()

    @staticmethod
    async def _build_user_cache(db: AsyncSession, user_ids: set) -> Dict[UUID, User]:
        """Batch-fetch users to avoid N+1 queries."""
        if not user_ids:
            return {}
        result = await db.execute(select(User).where(User.user_id.in_(user_ids)))
        users = result.scalars().all()
        return {u.user_id: u for u in users}

    @staticmethod
    async def _collect_events(
        db: AsyncSession,
        lead: Lead,
        full: bool,
        event_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        events: List[Dict[str, Any]] = []

        # ── 1. Calls + AI Summaries ──────────────────────────────
        if event_type in (None, "call", "ai_summary"):
            call_result = await db.execute(
                select(Call)
                .options(selectinload(Call.analysis))
                .where(Call.lead_id == lead.lead_id)
            )
            calls = call_result.scalars().all()

            for call in calls:
                if event_type in (None, "call"):
                    call_event = TimelineService._format_call_event(call, full)
                    events.append(call_event)

                if event_type in (None, "ai_summary") and call.analysis:
                    ai_event = TimelineService._format_ai_summary_event(call, full)
                    events.append(ai_event)

        # ── 2. Comments ──────────────────────────────────────────
        if event_type in (None, "comment"):
            comment_result = await db.execute(
                select(LeadComment).where(LeadComment.lead_id == lead.lead_id)
            )
            comments = comment_result.scalars().all()
            for c in comments:
                events.append(TimelineService._format_comment_event(c, full))

        # ── 3. Status changes ────────────────────────────────────
        if event_type in (None, "status_change"):
            history_result = await db.execute(
                select(LeadStatusHistory).where(LeadStatusHistory.lead_id == lead.lead_id)
            )
            history_rows = history_result.scalars().all()
            for h in history_rows:
                events.append(TimelineService._format_status_change_event(h, full))

        # ── 4. Lead created ──────────────────────────────────────
        if event_type in (None, "lead_created"):
            events.append(TimelineService._format_lead_created_event(lead, full))

        # ── Resolve agent names in bulk ──────────────────────────
        user_ids: set = set()
        for e in events:
            if e.get("_user_id"):
                user_ids.add(e["_user_id"])

        user_cache = await TimelineService._build_user_cache(db, user_ids)

        for e in events:
            uid = e.pop("_user_id", None)
            if uid and uid in user_cache:
                e["agent_name"] = user_cache[uid].full_name
                e["agent_id"] = str(uid)
            else:
                e["agent_name"] = "Unknown"
                e["agent_id"] = str(uid) if uid else None

        # ── Sort by timestamp descending ─────────────────────────
        events.sort(key=lambda e: e.get("timestamp", ""), reverse=True)

        return events

    # ── Event Formatters ─────────────────────────────────────────────────────

    @staticmethod
    def _format_call_event(call: Call, full: bool) -> dict:
        data: Dict[str, Any] = {
            "direction": call.direction,
            "duration": call.duration,
            "status": call.status,
            "destination": call.destination,
            "is_roll": call.is_roll,
        }
        if full:
            data.update({
                "call_id": str(call.call_id),
                "number_called_from": None,  # populated from lead if needed
                "recording_url": call.recording_url,
                "twilio_sid": call.twilio_sid,
            })

        return {
            "event_id": str(call.call_id),
            "type": "call",
            "timestamp": call.created_at.isoformat(),
            "_user_id": call.user_id,
            "data": data,
        }

    @staticmethod
    def _format_ai_summary_event(call: Call, full: bool) -> dict:
        analysis = call.analysis
        data: Dict[str, Any] = {
            "summary": analysis.summary,
            "sentiment": analysis.sentiment,
        }
        if full:
            data.update({
                "analysis_id": str(analysis.analysis_id),
                "call_id": str(call.call_id),
                "key_points": analysis.key_points,
                "next_action": analysis.next_action,
                "transcript": analysis.transcript,
                "transcription_status": analysis.transcription_status,
            })

        return {
            "event_id": str(analysis.analysis_id),
            "type": "ai_summary",
            "timestamp": analysis.created_at.isoformat(),
            "_user_id": call.user_id,
            "data": data,
        }

    @staticmethod
    def _format_comment_event(comment: LeadComment, full: bool) -> dict:
        data: Dict[str, Any] = {
            "content": comment.content,
        }
        if full:
            data.update({
                "comment_id": str(comment.comment_id),
                "created_at": comment.created_at.isoformat(),
            })

        return {
            "event_id": str(comment.comment_id),
            "type": "comment",
            "timestamp": comment.created_at.isoformat(),
            "_user_id": comment.user_id,
            "data": data,
        }

    @staticmethod
    def _format_status_change_event(history: LeadStatusHistory, full: bool) -> dict:
        data: Dict[str, Any] = {
            "old_status": history.old_status,
            "new_status": history.new_status,
            "follow_up_date": history.follow_up_date.isoformat() if history.follow_up_date else None,
            "comment": history.comment,
        }
        if full:
            data["history_id"] = str(history.history_id)

        return {
            "event_id": str(history.history_id),
            "type": "status_change",
            "timestamp": history.created_at.isoformat(),
            "_user_id": history.user_id,
            "data": data,
        }

    @staticmethod
    def _format_lead_created_event(lead: Lead, full: bool) -> dict:
        data: Dict[str, Any] = {
            "name": lead.name,
            "phone": lead.phone_number,
        }
        if full:
            data.update({
                "lead_id": str(lead.lead_id),
                "campaign_name": lead.campaign_name,
                "extra_data": lead.extra_data,
            })

        return {
            "event_id": str(lead.lead_id),
            "type": "lead_created",
            "timestamp": lead.created_at.isoformat(),
            "_user_id": lead.created_by,
            "data": data,
        }
