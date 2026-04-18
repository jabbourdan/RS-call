from datetime import datetime, timedelta
from uuid import UUID, uuid4
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.base import Call, Lead, Campaign, CampaignSettings, User, OrgPhoneNumber
from app.core.config import settings
from app.integrations.twilio_client import TwilioClient

# Seconds to wait for agent status confirmation before auto-proceeding
ROLL_PAUSE_TIMEOUT_SECONDS = 60

# Hard minimum cooldown between consecutive dials of the same lead, regardless
# of campaign cooldown_minutes. Prevents immediate re-dial loops when a call
# ends quickly (e.g. no-answer auto-advance). Must be larger than Twilio's
# no-answer timeout (~30s) or the boundary check won't catch it.
MIN_SAME_LEAD_COOLDOWN_SECONDS = 90


# =========================
# RollService
# =========================

class RollService:

    # ── START ROLL ────────────────────────────────────────────────────────────

    @staticmethod
    async def start_roll(
        db: AsyncSession,
        campaign_id: UUID,
        current_user: User,
    ) -> dict:

        campaign = await RollService._get_campaign(db, campaign_id, current_user)
        settings_obj = await RollService._get_settings(db, campaign_id)

        if settings_obj.roll_active:
            raise HTTPException(
                status_code=400,
                detail="Roll is already active for this campaign. Stop it first."
            )

        settings_obj.roll_active = True
        settings_obj.roll_paused = False
        settings_obj.roll_paused_at = None
        await db.flush()

        next_lead = await RollService._get_next_lead(db, campaign_id, current_user, settings_obj)

        if not next_lead:
            settings_obj.roll_active = False
            await db.commit()
            return {
                "status": "stopped",
                "reason": "No leads available to call",
                "campaign_id": str(campaign_id),
            }

        call = await RollService._fire_call(
            db=db,
            lead=next_lead,
            campaign_id=campaign_id,
            current_user=current_user,
            settings_obj=settings_obj,
            agent_identity=str(current_user.user_id),
        )

        await db.commit()

        print(f"🎯 Roll started for campaign {campaign_id}")
        print(f"📞 First call: {next_lead.name} ({next_lead.phone_number})")

        return {
            "status": "started",
            "campaign_id": str(campaign_id),
            "call_id": str(call.call_id),
            "current_lead": {
                "lead_id": str(next_lead.lead_id),
                "name": next_lead.name,
                "phone_number": next_lead.phone_number,
            },
        }

    # ── STOP ROLL ─────────────────────────────────────────────────────────────

    @staticmethod
    async def stop_roll(
        db: AsyncSession,
        campaign_id: UUID,
        current_user: User,
    ) -> dict:

        await RollService._get_campaign(db, campaign_id, current_user)
        settings_obj = await RollService._get_settings(db, campaign_id)

        if not settings_obj.roll_active:
            return {
                "status": "already_stopped",
                "campaign_id": str(campaign_id),
                "message": "Roll was not active.",
            }

        settings_obj.roll_active = False
        settings_obj.roll_paused = False
        settings_obj.roll_paused_at = None
        await db.commit()

        print(f"🛑 Roll stopped for campaign {campaign_id}")

        return {
            "status": "stopped",
            "campaign_id": str(campaign_id),
            "message": "Roll stopped. Current call will finish naturally.",
        }

    # ── GET ROLL STATUS ───────────────────────────────────────────────────────

    @staticmethod
    async def get_roll_status(
        db: AsyncSession,
        campaign_id: UUID,
        current_user: User,
    ) -> dict:

        await RollService._get_campaign(db, campaign_id, current_user)
        settings_obj = await RollService._get_settings(db, campaign_id)

        roll_calls_result = await db.execute(
            select(func.count(Call.call_id)).where(
                Call.campaign_id == campaign_id,
                Call.org_id == current_user.org_id,
                Call.is_roll == True,
            )
        )
        calls_made = roll_calls_result.scalar() or 0

        answered_result = await db.execute(
            select(func.count(Call.call_id)).where(
                Call.campaign_id == campaign_id,
                Call.org_id == current_user.org_id,
                Call.is_roll == True,
                Call.status == "completed",
            )
        )
        calls_answered = answered_result.scalar() or 0

        no_answer_result = await db.execute(
            select(func.count(Call.call_id)).where(
                Call.campaign_id == campaign_id,
                Call.org_id == current_user.org_id,
                Call.is_roll == True,
                Call.status == "no_answer",
            )
        )
        calls_no_answer = no_answer_result.scalar() or 0

        # ── 60-second auto-proceed timeout ───────────────────────────────────
        if settings_obj.roll_paused and settings_obj.roll_paused_at:
            paused_at = settings_obj.roll_paused_at.replace(tzinfo=None) if settings_obj.roll_paused_at.tzinfo else settings_obj.roll_paused_at
            elapsed = datetime.utcnow() - paused_at
            if elapsed.total_seconds() > ROLL_PAUSE_TIMEOUT_SECONDS:
                print(f"⏱ Roll pause timeout for campaign {campaign_id} — auto-proceeding")
                settings_obj.roll_paused = False
                settings_obj.roll_paused_at = None
                await db.commit()
                await RollService._advance_roll(db=db, campaign_id=campaign_id, current_user=current_user)
                # Re-read settings to reflect updated state
                settings_obj = await RollService._get_settings(db, campaign_id)

        # ── Current call query (active if not paused, most recent if paused) ─
        if settings_obj.roll_paused:
            current_call_result = await db.execute(
                select(Call).where(
                    Call.campaign_id == campaign_id,
                    Call.org_id == current_user.org_id,
                    Call.is_roll == True,
                ).order_by(Call.created_at.desc()).limit(1)
            )
        else:
            current_call_result = await db.execute(
                select(Call).where(
                    Call.campaign_id == campaign_id,
                    Call.org_id == current_user.org_id,
                    Call.is_roll == True,
                    Call.status.in_(["initiated", "ringing", "in_progress"]),
                ).order_by(Call.created_at.desc()).limit(1)
            )
        current_call = current_call_result.scalars().first()

        current_lead_info = None
        if current_call and current_call.lead_id:
            lead_result = await db.execute(
                select(Lead).where(Lead.lead_id == current_call.lead_id)
            )
            lead = lead_result.scalars().first()
            if lead:
                current_lead_info = {
                    "lead_id": str(lead.lead_id),
                    "name": lead.name,
                    "phone_number": lead.phone_number,
                    "call_status": current_call.status,
                }

        EXCLUDED_STATUSES = {"לא רלוונטי", "עסקה נסגרה", "אל תתקשר"}
        leads_result = await db.execute(
            select(Lead).where(
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id,
            )
        )
        all_leads = leads_result.scalars().all()

        now = datetime.utcnow()
        today = now.date()
        cooldown_cutoff = now - timedelta(minutes=settings_obj.cooldown_minutes)

        leads_remaining = 0
        for lead in all_leads:
            current_status = lead.status.get("current", "ממתין") if lead.status else "ממתין"
            if current_status in EXCLUDED_STATUSES:
                continue
            if lead.tried_to_reach >= settings_obj.max_calls_to_unanswered_lead:
                continue
            if lead.last_call_at and lead.last_call_at > cooldown_cutoff:
                continue
            if current_status in ("ממתין", "לא ענה"):
                leads_remaining += 1
            elif current_status == "פולו אפ":
                if lead.follow_up_date and lead.follow_up_date.date() <= today:
                    leads_remaining += 1

        return {
            "roll_active": settings_obj.roll_active,
            "roll_paused": settings_obj.roll_paused,
            "campaign_id": str(campaign_id),
            "calls_made": calls_made,
            "calls_answered": calls_answered,
            "calls_no_answer": calls_no_answer,
            "current_call_id": str(current_call.call_id) if current_call else None,
            "current_lead": current_lead_info,
            "leads_remaining": leads_remaining,
        }

    # ── CONTINUE ROLL (called from webhook after call ends) ──────────────────

    @staticmethod
    async def continue_roll(
        db: AsyncSession,
        call: Call,
        current_user: User,
    ) -> None:
        if not call.campaign_id:
            print("⚠️ Roll: no campaign_id on call — stopping")
            return

        campaign_id = call.campaign_id
        settings_obj = await RollService._get_settings(db, campaign_id)

        if not settings_obj.roll_active:
            print(f"🛑 Roll stopped for campaign {campaign_id}")
            return

        await RollService.pause_roll(db=db, campaign_id=campaign_id)

    # ── PAUSE ROLL (set paused flag, wait for agent to proceed) ──────────────

    @staticmethod
    async def pause_roll(
        db: AsyncSession,
        campaign_id: UUID,
    ) -> None:
        settings_obj = await RollService._get_settings(db, campaign_id)
        settings_obj.roll_paused = True
        settings_obj.roll_paused_at = datetime.utcnow()
        await db.commit()
        print(f"⏸ Roll paused for campaign {campaign_id} — awaiting agent status update")

    # ── PROCEED ROLL (agent confirmed status; fire next call) ─────────────────

    @staticmethod
    async def proceed_roll(
        db: AsyncSession,
        campaign_id: UUID,
        current_user: User,
    ) -> dict:
        await RollService._get_campaign(db, campaign_id, current_user)
        settings_obj = await RollService._get_settings(db, campaign_id)

        if not settings_obj.roll_active:
            raise HTTPException(status_code=400, detail="Roll is not active.")

        settings_obj.roll_paused = False
        settings_obj.roll_paused_at = None
        await db.commit()

        await RollService._advance_roll(db=db, campaign_id=campaign_id, current_user=current_user)

        return await RollService.get_roll_status(db=db, campaign_id=campaign_id, current_user=current_user)

    # ── ADVANCE ROLL (pick next lead and fire call) ───────────────────────────

    @staticmethod
    async def _advance_roll(
        db: AsyncSession,
        campaign_id: UUID,
        current_user: User,
        exclude_lead_id: Optional[UUID] = None,
        previous_call_id: Optional[UUID] = None,
    ) -> None:
        settings_obj = await RollService._get_settings(db, campaign_id)

        # Tear down the specific previous conference (if given) so the agent
        # browser isn't stuck in an empty room. We accept an EXPLICIT call_id
        # rather than looking up "most recent" — on a webhook retry, the most
        # recent call is the brand-new one we just fired, and terminating it
        # causes the "2-second second call" bug.
        if previous_call_id:
            await RollService._terminate_roll_conference(previous_call_id)

        next_lead = await RollService._get_next_lead(
            db=db,
            campaign_id=campaign_id,
            current_user=current_user,
            settings_obj=settings_obj,
            exclude_lead_id=exclude_lead_id,
        )

        if not next_lead:
            print(f"✅ Roll completed for campaign {campaign_id} — no more leads")
            settings_obj.roll_active = False
            await db.commit()
            return

        await RollService._fire_call(
            db=db,
            lead=next_lead,
            campaign_id=campaign_id,
            current_user=current_user,
            settings_obj=settings_obj,
            agent_identity=str(current_user.user_id),
        )

        await db.commit()
        print(f"📞 Roll next call: {next_lead.name} ({next_lead.phone_number})")

    # ── HANDLE NO-ANSWER (auto-advance without agent confirmation) ────────────

    @staticmethod
    async def handle_no_answer(
        db: AsyncSession,
        call: Call,
    ) -> None:
        """
        Called from the webhook when a roll call ends with no_answer/failed.
        Skips the pause-for-status-confirm step and advances immediately.
        """
        if not call.campaign_id:
            return

        settings_obj = await RollService._get_settings(db, call.campaign_id)
        if not settings_obj.roll_active:
            return

        # Idempotency: if a newer roll call already exists for this campaign,
        # we've already advanced past this failed call. Webhook retries from
        # Twilio (when our handler exceeds the 15s timeout) would otherwise
        # trigger a second advance that kills the just-fired new call and
        # manifests as the "2-second second call" bug.
        newer_result = await db.execute(
            select(Call).where(
                Call.campaign_id == call.campaign_id,
                Call.org_id == call.org_id,
                Call.is_roll == True,
                Call.created_at > call.created_at,
            ).limit(1)
        )
        if newer_result.scalars().first():
            print(f"⏭ Roll already advanced past call {call.call_id} — skipping")
            return

        # Clear any previously paused state — we're taking ownership of the
        # advance directly from the webhook.
        settings_obj.roll_paused = False
        settings_obj.roll_paused_at = None
        await db.commit()

        # Look up the agent user who owns this call so _advance_roll's
        # tenant-scoped queries work correctly.
        user_res = await db.execute(select(User).where(User.user_id == call.user_id))
        current_user = user_res.scalars().first()
        if not current_user:
            print(f"⚠️ Roll no-answer auto-advance: user {call.user_id} not found")
            return

        try:
            # Explicitly exclude the lead we just no-answered so it can never
            # be picked again on this same advance — belt-and-suspenders on
            # top of the MIN_SAME_LEAD_COOLDOWN_SECONDS check.
            await RollService._advance_roll(
                db=db,
                campaign_id=call.campaign_id,
                current_user=current_user,
                exclude_lead_id=call.lead_id,
                previous_call_id=call.call_id,
            )
        except Exception as e:
            print(f"⚠️ Roll no-answer auto-advance error: {e}")

    # ── TERMINATE A SPECIFIC ROLL CONFERENCE ──────────────────────────────────

    @staticmethod
    async def _terminate_roll_conference(call_id: UUID) -> None:
        """
        Kill any still-active conference legs belonging to this specific call.
        Takes an EXPLICIT call_id so webhook retries can't accidentally
        terminate a brand-new conference by picking it up as "most recent".
        """
        conf_name = f"roll_{str(call_id).replace('-', '')}"
        try:
            twilio = TwilioClient()
            conferences = twilio.client.conferences.list(
                friendly_name=conf_name, status="in-progress"
            )
            for conf in conferences:
                for participant in twilio.client.conferences(conf.sid).participants.list():
                    try:
                        twilio.client.conferences(conf.sid).participants(
                            participant.call_sid
                        ).update(status="completed")
                    except Exception as e:
                        print(f"⚠️ Could not drop participant {participant.call_sid}: {e}")
        except Exception as e:
            print(f"⚠️ Conference cleanup error for {conf_name}: {e}")

    # ── HELPERS ───────────────────────────────────────────────────────────────

    @staticmethod
    async def _get_campaign(db, campaign_id, current_user):
        result = await db.execute(
            select(Campaign).where(
                Campaign.campaign_id == campaign_id,
                Campaign.org_id == current_user.org_id,
            )
        )
        campaign = result.scalars().first()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found.")
        return campaign

    @staticmethod
    async def _get_settings(db, campaign_id):
        result = await db.execute(
            select(CampaignSettings).where(CampaignSettings.campaign_id == campaign_id)
        )
        settings_obj = result.scalars().first()
        if not settings_obj:
            raise HTTPException(status_code=404, detail="Campaign settings not found.")
        return settings_obj

    @staticmethod
    async def _get_next_lead(
        db: AsyncSession,
        campaign_id: UUID,
        current_user: User,
        settings_obj: CampaignSettings,
        exclude_lead_id: Optional[UUID] = None,
    ) -> Optional[Lead]:

        EXCLUDED_STATUSES = {"לא רלוונטי", "עסקה נסגרה", "אל תתקשר"}

        result = await db.execute(
            select(Lead).where(
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id,
            )
        )
        all_leads = result.scalars().all()

        now = datetime.utcnow()
        today = now.date()
        cooldown_cutoff = now - timedelta(minutes=settings_obj.cooldown_minutes)
        min_safety_cutoff = now - timedelta(seconds=MIN_SAME_LEAD_COOLDOWN_SECONDS)

        eligible = []
        for lead in all_leads:
            # Hard-exclude the lead that was just dialed (e.g. the one that
            # just no-answered) — regardless of cooldown settings.
            if exclude_lead_id and lead.lead_id == exclude_lead_id:
                continue
            current_status = lead.status.get("current", "ממתין") if lead.status else "ממתין"
            if current_status in EXCLUDED_STATUSES:
                continue
            if lead.tried_to_reach >= settings_obj.max_calls_to_unanswered_lead:
                continue
            if lead.last_call_at and lead.last_call_at > cooldown_cutoff:
                continue
            # Hard safety: never redial the same lead within MIN_SAME_LEAD_COOLDOWN_SECONDS,
            # even if the campaign cooldown is 0. Use >= so the boundary case
            # (last_call_at exactly equal to cutoff) still blocks the redial.
            if lead.last_call_at and lead.last_call_at >= min_safety_cutoff:
                continue
            if current_status in ("ממתין", "לא ענה"):
                eligible.append(lead)
            elif current_status == "פולו אפ":
                if lead.follow_up_date and lead.follow_up_date.date() <= today:
                    eligible.append(lead)

        if not eligible:
            return None

        algorithm = settings_obj.calling_algorithm or "priority"

        if algorithm == "random":
            eligible.sort(key=lambda l: l.created_at)
        elif algorithm == "sequential":
            eligible.sort(key=lambda l: (l.tried_to_reach, l.created_at))
        else:
            def priority_key(lead):
                cs = lead.status.get("current", "ממתין") if lead.status else "ממתין"
                is_followup = (
                    cs == "פולו אפ"
                    and lead.follow_up_date
                    and lead.follow_up_date.date() <= today
                )
                return (
                    0 if is_followup else 1,
                    0 if lead.tried_to_reach == 0 else 1,
                    lead.tried_to_reach,
                    lead.created_at,
                )
            eligible.sort(key=priority_key)

        return eligible[0]

    @staticmethod
    async def _pick_phone_number(settings_obj: CampaignSettings, db: AsyncSession = None) -> str:
        if settings_obj.primary_phone_id and db:
            result = await db.execute(
                select(OrgPhoneNumber).where(
                    OrgPhoneNumber.phone_id == settings_obj.primary_phone_id,
                    OrgPhoneNumber.is_active == True,
                )
            )
            phone = result.scalars().first()
            if phone:
                return phone.phone_number
        return settings.FROM_NUMBER

    @staticmethod
    async def _fire_call(
        db: AsyncSession,
        lead: Lead,
        campaign_id: UUID,
        current_user: User,
        settings_obj: CampaignSettings,
        agent_identity: Optional[str] = None,
    ) -> Call:
        import re

        def to_international(phone: str) -> str:
            cleaned = re.sub(r"[\s\-\.\(\)\/]", "", phone.strip())
            if cleaned.startswith("+972"):
                return cleaned
            if cleaned.startswith("972"):
                return "+" + cleaned
            if cleaned.startswith("0"):
                return "+972" + cleaned[1:]
            return "+972" + cleaned

        from_number = await RollService._pick_phone_number(settings_obj, db=db)
        to_number = to_international(lead.phone_number)

        # ── Create Call record ────────────────────────────────────
        call = Call(
            org_id=current_user.org_id,
            user_id=current_user.user_id,
            campaign_id=campaign_id,
            lead_id=lead.lead_id,
            destination=lead.phone_number,
            direction="outbound",
            status="initiated",
            is_roll=True,
        )
        db.add(call)
        await db.flush()

        # ── Generate unique conference room name ──────────────────
        conf_name = f"roll_{str(call.call_id).replace('-', '')}"

        twilio_client = TwilioClient()

        if agent_identity:
            # ── Leg 1: Call agent browser ─────────────────────────
            print(f"📲 Calling agent browser: {agent_identity}")
            twilio_client.client.calls.create(
                to=f"client:{agent_identity}",
                from_=from_number,
                url=f"{settings.BASE_URL}/api/v1/calls/conference-agent?conf={conf_name}&call_id={str(call.call_id)}",
            )

            # ── Leg 2: Call lead phone ────────────────────────────
            print(f"📞 Calling lead: {to_number}")
            twilio_call = twilio_client.client.calls.create(
                to=to_number,
                from_=from_number,
                url=f"{settings.BASE_URL}/api/v1/calls/conference-lead?conf={conf_name}&call_id={str(call.call_id)}",
                status_callback=f"{settings.BASE_URL}/api/v1/calls/webhook?call_id={str(call.call_id)}",
                status_callback_method="POST",
                status_callback_event=["initiated", "ringing", "answered", "completed"],
                timeout=max(5, settings_obj.ring_timeout_seconds),
            )
        else:
            # ── Fallback: no browser — just record ────────────────
            twilio_call = twilio_client.client.calls.create(
                to=to_number,
                from_=from_number,
                url=f"{settings.BASE_URL}/api/v1/calls/voice?call_id={str(call.call_id)}",
                status_callback=f"{settings.BASE_URL}/api/v1/calls/webhook?call_id={str(call.call_id)}",
                status_callback_method="POST",
                status_callback_event=["initiated", "ringing", "answered", "completed"],
            )

        call.twilio_sid = twilio_call.sid
        call.status = "ringing"

        lead.tried_to_reach += 1
        lead.sum_calls_performed += 1
        lead.last_call_at = datetime.utcnow()
        lead.number_called_from = from_number
        lead.called_by = current_user.user_id

        print(f"✅ Conference room: {conf_name}")
        return call