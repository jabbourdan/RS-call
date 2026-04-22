import os
import botocore.exceptions
from pathlib import Path
from uuid import uuid4, UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional

from app.core.dependencies import get_current_user
from app.database import get_session
from app.integrations.aws_s3 import S3Client
from app.integrations.aws_transcribe import TranscribeClient
from app.integrations.twilio_client import TwilioClient
from app.models.base import Call, CallAnalysis, Lead, User
from app.services.transcibe_service import TranscribeService
from app.services.llm_service import LLMService
from app.core.config import settings

router = APIRouter(prefix="/calls/test", tags=["Calls — Test Tools"])

transcribe_service = TranscribeService()
transcribe_client = TranscribeClient()

_ALLOWED_AUDIO_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/mp4", "audio/m4a", "audio/x-m4a",
}


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreateCallRequest(BaseModel):
    to_number: Optional[str] = None


class TestTranscriptRequest(BaseModel):
    transcript: Optional[str] = None


# =============================================================================
# TEST TOOLS — for development only, not used in production
# =============================================================================

@router.post("/create-call", summary="TEST — Fire a raw Twilio call to any number")
def create_test_call(payload: CreateCallRequest):
    """
    Quick test — fires a Twilio call to any number.
    Not linked to any lead, campaign, or DB record.
    """
    to_number = payload.to_number or settings.TO_NUMBER
    twilio_client = TwilioClient()
    try:
        call = twilio_client.create_test_call(to_number=to_number)
        return {"status": "initiated", "call_sid": call.sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transcription", summary="TEST — Transcribe a local MP3 file")
async def run_test_transcription():
    """
    Quick test — transcribes resources/voicetest2.mp3.
    Useful to verify AWS S3 and Transcribe are working.
    """
    file_path = "resources/voicetest2.mp3"
    try:
        result = await transcribe_service.transcribe_audio_file(file_path)
        return {
            "status": "Accepted",
            "message": "Transcription job sent to AWS",
            "details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/result/{job_name}", summary="TEST — Check AWS Transcribe job result")
async def get_transcript_result(job_name: str):
    """
    Checks AWS Transcribe job status.
    Returns the full transcript text if the job is complete.
    """
    try:
        job_info = transcribe_client.get_job_result(job_name)
        if job_info["status"] == "COMPLETED":
            text = await transcribe_client.download_transcript_with_speakers(job_info["url"])
            return {"job_name": job_name, "status": "COMPLETED", "transcript": text}
        elif job_info["status"] == "FAILED":
            return {"status": "FAILED", "message": "AWS Transcribe job failed."}
        else:
            return {"status": job_info["status"], "message": "Still in progress."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/list-jobs", summary="TEST — List recent AWS Transcribe jobs")
async def list_transcription_jobs(limit: int = 10):
    """
    Returns a list of recent AWS Transcribe jobs.
    Useful to check job history and statuses.
    """
    try:
        raw_jobs = transcribe_client.list_recent_jobs(limit=limit)
        formatted_jobs = [
            {
                "job_name": job.get("TranscriptionJobName"),
                "status": job.get("TranscriptionJobStatus"),
                "created_at": job.get("CreationTime"),
                "failure_reason": job.get("FailureReason")
            }
            for job in raw_jobs
        ]
        return {"total_returned": len(formatted_jobs), "jobs": formatted_jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch jobs: {str(e)}")


@router.post("/ai-analysis", summary="TEST — Analyze a transcript with AI")
async def test_ai_analysis(payload: TestTranscriptRequest):
    # 1. Define your default script
    default_script = """Agent: שלום, במה אוכל לעזור?
Client: שלום, אני מתקשר בנוגע לדירה שפרסמתם בתל אביב
Agent: כן, איזו דירה מעניינת אותך?
Client: הדירה ברחוב דיזנגוף, 3 חדרים
Agent: מצוין, מה התקציב שלך?
Client: עד מיליון וחצי שקל
Agent: בסדר גמור, אני אשלח לך פרטים נוספים במייל
Client: תודה רבה, מחכה לשמוע"""

    # 2. If 'transcript' is None or "", use the default_script
    # The 'or' operator is perfect here as it catches both None and empty strings
    transcript_to_analyze = payload.transcript or default_script

    try:
        service = LLMService(model="fast")
        result = await service.analyze_call(transcript_to_analyze)
        
        return {
            "status": "success",
            "using_default": not bool(payload.transcript), # Tells you if the default was used
            "transcript_used": transcript_to_analyze,       # Returns the full text so you can see it
            "analysis": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


@router.post("/upload-audio", summary="TEST — Upload audio file and run full pipeline")
async def upload_audio_for_testing(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    lead_id: Optional[str] = Query(default=None, description="Lead ID to attach this call to. Omit to auto-pick a random lead from your org."),
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Upload any MP3/WAV file and run the full pipeline:
    S3 upload → AWS Transcribe → AI analysis → saved to DB.
    Pass lead_id to attach to a specific lead, or omit to use a random lead.
    Returns call_id + lead_id so you can open the timeline directly.
    """
    if file.content_type not in _ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Use MP3 or WAV.",
        )

    # Resolve lead — use provided ID or pick a random lead from this org
    resolved_lead_id = None
    resolved_campaign_id = None
    if lead_id:
        lead_result = await db.execute(
            select(Lead).where(
                Lead.lead_id == UUID(lead_id),
                Lead.org_id == current_user.org_id,
            )
        )
        lead = lead_result.scalars().first()
        if not lead:
            raise HTTPException(status_code=404, detail=f"Lead {lead_id} not found in your org.")
        resolved_lead_id = lead.lead_id
        resolved_campaign_id = lead.campaign_id
    else:
        random_result = await db.execute(
            select(Lead)
            .where(Lead.org_id == current_user.org_id)
            .order_by(func.random())
            .limit(1)
        )
        lead = random_result.scalars().first()
        if lead:
            resolved_lead_id = lead.lead_id
            resolved_campaign_id = lead.campaign_id

    call_id = uuid4()
    job_name = f"job_{call_id}"
    s3_key = f"recordings/{call_id}.mp3"
    suffix = Path(file.filename).suffix if file.filename else ".mp3"
    tmp_path = f"/tmp/upload_{call_id}{suffix}"

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        with open(tmp_path, "wb") as fout:
            fout.write(contents)

        call = Call(
            call_id=call_id,
            org_id=current_user.org_id,
            user_id=current_user.user_id,
            lead_id=resolved_lead_id,
            campaign_id=resolved_campaign_id,
            status="completed",
            direction="outbound",
            recording_url=f"local_upload:{file.filename}",
        )
        db.add(call)
        await db.flush()

        analysis = CallAnalysis(
            call_id=call_id,
            transcription_status="queued",
        )
        db.add(analysis)
        await db.flush()

        s3 = S3Client()
        tc = TranscribeClient()
        s3_uri = s3.upload_local_file(tmp_path, s3_key)
        tc.start_job(job_name, s3_uri)

        analysis.job_name = job_name
        analysis.s3_uri = s3_uri
        analysis.transcription_status = "processing"
        await db.commit()

        background_tasks.add_task(
            TranscribeService.process_transcript_background,
            str(call_id),
            job_name,
        )

        return {
            "status": "accepted",
            "message": "Audio uploaded. Transcription + AI analysis running in background.",
            "call_id": str(call_id),
            "lead_id": str(resolved_lead_id) if resolved_lead_id else None,
            "job_name": job_name,
            "s3_uri": s3_uri,
            "poll_url": f"/api/v1/calls/{call_id}",
            "timeline_url": f"/api/v1/leads/{resolved_lead_id}/timeline/full" if resolved_lead_id else None,
        }

    except HTTPException:
        raise
    except botocore.exceptions.ClientError as e:
        raise HTTPException(status_code=502, detail=f"AWS error: {e.response['Error']['Message']}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)