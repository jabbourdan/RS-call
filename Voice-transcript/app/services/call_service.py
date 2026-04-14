from datetime import datetime
from uuid import UUID
import re
import httpx
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List, Dict

from app.models.base import Call, Lead, Campaign, CampaignSettings, User, CallAnalysis
from app.services.transcibe_service import TranscribeService
from app.services.llm_service import LLMService
from app.integrations.twilio_client import TwilioClient
from app.integrations.aws_transcribe import TranscribeClient
from app.core.config import settings


# =========================
# Utility: Phone Formatter
# =========================

def to_international(phone: str, country_code: str = "+972") -> str:
    """
    Ensures phone numbers are in E.164 format for Twilio.
    Example: 0501234567 -> +972501234567
    """
    if not phone:
        raise ValueError("Phone number is empty.")

    cleaned = re.sub(r"[\s\-\.\(\)\/]", "", phone.strip())

    if cleaned.startswith("+"):
        return cleaned
    if cleaned.startswith("972"):
        return "+" + cleaned
    if cleaned.startswith("0"):
        return country_code + cleaned[1:]

    return country_code + cleaned


# =========================
# CallService
# =========================

class CallService:

    # ── 1. START OUTBOUND CALL ───────────────────────────────────────────────

    @staticmethod
    async def start_call(
        db: AsyncSession,
        lead_id: UUID,
        campaign_id: UUID,
        current_user: User,
    ) -> dict:
        # Fetch Lead & Campaign with Organization Guard
        lead_result = await db.execute(
            select(Lead).where(
                Lead.lead_id == lead_id, 
                Lead.campaign_id == campaign_id,
                Lead.org_id == current_user.org_id
            )
        )
        lead = lead_result.scalars().first()
        
        camp_result = await db.execute(
            select(Campaign).where(
                Campaign.campaign_id == campaign_id, 
                Campaign.org_id == current_user.org_id
            )
        )
        campaign = camp_result.scalars().first()

        if not lead or not campaign:
            raise HTTPException(status_code=404, detail="Lead or Campaign not found.")

        # Get Caller ID from Settings
        settings_result = await db.execute(
            select(CampaignSettings).where(CampaignSettings.campaign_id == campaign_id)
        )
        camp_settings = settings_result.scalars().first()

        # Initialize Call Record
        call = Call(
            org_id=current_user.org_id,
            user_id=current_user.user_id,
            campaign_id=campaign_id,
            lead_id=lead_id,
            destination=lead.phone_number,
            status="initiated",
        )
        db.add(call)
        await db.flush()

        try:
            twilio = TwilioClient()
            from_number = (
                camp_settings.phone_number_used1
                if camp_settings and camp_settings.phone_number_used1
                else settings.FROM_NUMBER
            )
            to_number = to_international(lead.phone_number)

            # ── Conference bridge — same pattern as roll ──────────
            conf_name = f"manual_{str(call.call_id).replace('-', '')}"
            agent_identity = str(current_user.user_id)

            # Leg 1: Call the agent's browser into the conference
            print(f"📲 Calling agent browser: {agent_identity}")
            twilio.client.calls.create(
                to=f"client:{agent_identity}",
                from_=from_number,
                url=f"{settings.BASE_URL}/api/v1/calls/conference-agent?conf={conf_name}&call_id={str(call.call_id)}",
            )

            # Leg 2: Call the lead's phone into the same conference
            print(f"📞 Calling lead: {to_number}")
            twilio_call = twilio.client.calls.create(
                to=to_number,
                from_=from_number,
                url=f"{settings.BASE_URL}/api/v1/calls/conference-lead?conf={conf_name}&call_id={str(call.call_id)}",
                status_callback=f"{settings.BASE_URL}/api/v1/calls/webhook?call_id={str(call.call_id)}",
                status_callback_method="POST",
                status_callback_event=["initiated", "ringing", "answered", "completed"],
            )

            print(f"✅ Conference room: {conf_name}")

            call.twilio_sid = twilio_call.sid
            call.status = "ringing"

            # Manual single-lead call — only track who/when
            # (tried_to_reach & sum_calls_performed are only incremented by roll calls)
            lead.last_call_at = datetime.utcnow()
            lead.called_by = current_user.user_id

            await db.commit()

            return {
                "call_id": str(call.call_id), 
                "status": "ringing", 
                "to": to_number,
                "lead_name": lead.name
            }

        except Exception as e:
            await db.rollback()
            print(f"❌ Twilio Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to initiate call.")

    # ── 2. HANDLE STATUS WEBHOOK ─────────────────────────────────────────────

    @staticmethod
    async def handle_webhook(
        db: AsyncSession,
        form_data: dict
    ) -> dict:
        call_sid = form_data.get("CallSid")
        call_status = form_data.get("CallStatus")
        call_duration = form_data.get("CallDuration", 0)
        internal_call_id = form_data.get("internal_call_id")

        call = None
        if internal_call_id:
            result = await db.execute(select(Call).where(Call.call_id == UUID(internal_call_id)))
            call = result.scalars().first()

        if not call and call_sid:
            result = await db.execute(select(Call).where(Call.twilio_sid == call_sid))
            call = result.scalars().first()

        if not call:
            return {"status": "ignored", "reason": "Call not found"}

        status_map = {
            "initiated":   "initiated",
            "ringing":     "ringing",
            "in-progress": "in_progress",
            "completed":   "completed",
            "failed":      "failed",
            "busy":        "failed",
            "no-answer":   "no_answer",
            "canceled":    "failed",
        }

        new_status = status_map.get(call_status, call_status)
        call.status = new_status

        if call_duration:
            call.duration = int(call_duration)

        await db.commit()

        is_ended = new_status in ["completed", "no_answer", "failed"]
        if getattr(call, "is_roll", False) and is_ended:
            try:
                from app.services.roll_service import RollService
                user_res = await db.execute(select(User).where(User.user_id == call.user_id))
                user = user_res.scalars().first()
                if user:
                    await RollService.continue_roll(db=db, call=call, current_user=user)
            except Exception as e:
                print(f"⚠️ Roll Error: {e}")

        return {"status": "updated", "call_id": str(call.call_id)}

    # ── 3. HANDLE RECORDING WEBHOOK (FIXED) ──────────────────────────────────

    @staticmethod
    async def handle_recording_webhook(
        db: AsyncSession, 
        form_data: dict, 
        call_id: Optional[UUID] = None  # Receives UUID from router
    ) -> dict:
        print(f'--- Processing recording for call_id: {call_id}')
        
        recording_url = form_data.get("RecordingUrl")
        recording_sid = form_data.get("RecordingSid")
        
        if not recording_url:
            return {"status": "error", "message": "No recording URL"}

        if not call_id:
            print("⚠️ Webhook received without call_id parameter.")
            return {"status": "ignored", "reason": "No call_id provided"}

        # ─── 1. STRICT INTERNAL LOOKUP ────────────────────────────────────────
        # We only look up by our primary key (UUID)
        result = await db.execute(select(Call).where(Call.call_id == call_id))
        call = result.scalars().first()

        if not call:
            print(f"⚠️ Call record not found in DB for UUID: {call_id}")
            return {"status": "ignored", "reason": "Call not found"}
        # ──────────────────────────────────────────────────────────────────────

        # Save the Twilio Recording SID to our record
        call.recording_sid = recording_sid
        await db.flush()

        # Download MP3 from Twilio
        temp_path = f"/tmp/{recording_sid}.mp3"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{recording_url}.mp3", 
                auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            )
            if resp.status_code == 200:
                with open(temp_path, "wb") as f:
                    f.write(resp.content)
            else:
                return {"status": "failed", "reason": "MP3 download failed"}

        # Start Transcription Job
        try:
            transcribe_service = TranscribeService()
            aws_res = await transcribe_service.transcribe_audio_file(temp_path)
            
            # Upsert CallAnalysis record
            analysis_res = await db.execute(select(CallAnalysis).where(CallAnalysis.call_id == call.call_id))
            analysis = analysis_res.scalars().first()

            if not analysis:
                analysis = CallAnalysis(call_id=call.call_id)
                db.add(analysis)

            analysis.job_name = aws_res.get("job_name")
            analysis.s3_uri = aws_res.get("s3_uri")
            analysis.transcription_status = "processing"
            
            await db.commit()

            # RETURN FOR ROUTER: These keys trigger the background_tasks.add_task
            return {
                "status": "processing", 
                "transcription_job": analysis.job_name, 
                "call_id": str(call.call_id)
            }
        except Exception as e:
            print(f"❌ Transcription Start Error: {e}")
            await db.rollback()
            return {"status": "error"}
    # ── 4. GET CALL STATUS & SYNC ANALYSIS ──────────────────────────────────

    @staticmethod
    async def get_call_status(db: AsyncSession, call_id: UUID, current_user: User) -> dict:
        result = await db.execute(
            select(Call).where(Call.call_id == call_id, Call.org_id == current_user.org_id)
        )
        call = result.scalars().first()
        if not call:
            raise HTTPException(status_code=404, detail="Call not found.")

        analysis_result = await db.execute(select(CallAnalysis).where(CallAnalysis.call_id == call_id))
        analysis = analysis_result.scalars().first()

        if analysis and analysis.transcription_status in ["queued", "processing"] and analysis.job_name:
            try:
                t_client = TranscribeClient()
                job_info = t_client.get_job_result(analysis.job_name)

                if job_info.get("status") == "COMPLETED":
                    data = await t_client.download_transcript_with_speakers(job_info["url"])
                    
                    analysis.transcript = data["plain_text"]
                    analysis.transcript_json = data["segments"]
                    analysis.transcription_status = "completed"

                    if data["segments"]:
                        llm = LLMService(model="fast")
                        insights = await llm.analyze_call(data["segments"])
                        
                        analysis.summary = insights.get("summary")
                        analysis.sentiment = insights.get("sentiment")
                        analysis.key_points = insights.get("key_points")
                        analysis.next_action = insights.get("next_action")

                    analysis.updated_at = datetime.utcnow()
                    await db.commit()

                elif job_info.get("status") == "FAILED":
                    analysis.transcription_status = "failed"
                    await db.commit()

            except Exception as e:
                print(f"⚠️ Sync/Analysis Error: {e}")

        return {
            "call_id": str(call.call_id),
            "twilio_sid": call.twilio_sid,
            "status": call.status,
            "duration": call.duration,
            "destination": call.destination,
            "recording_url": (
                f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Recordings/{call.recording_sid}.mp3"
                if call.recording_sid else None
            ),
            "analysis": {
                "status": analysis.transcription_status,
                "transcript": analysis.transcript,
                "transcript_json": analysis.transcript_json,
                "insights": {
                    "summary": analysis.summary,
                    "sentiment": analysis.sentiment,
                    "key_points": analysis.key_points,
                    "next_action": analysis.next_action
                }
            } if analysis else None
        }