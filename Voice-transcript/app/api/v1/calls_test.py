from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.integrations.twilio_client import TwilioClient
from app.integrations.aws_transcribe import TranscribeClient
from app.services.transcibe_service import TranscribeService
from app.services.llm_service import LLMService
from app.core.config import settings

router = APIRouter(prefix="/calls/test", tags=["Calls — Test Tools"])

transcribe_service = TranscribeService()
transcribe_client = TranscribeClient()


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