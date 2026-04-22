import uuid
import asyncio
import botocore
from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from app.integrations.aws_s3 import S3Client
from app.integrations.aws_transcribe import TranscribeClient
from app.database import get_session


class TranscribeService:
    def __init__(self):
        self.s3 = S3Client()
        self.transcribe = TranscribeClient()

    # ── TRANSCRIBE AUDIO FILE ─────────────────────────────────────────────────

    async def transcribe_audio_file(self, local_path: str):
        call_id = str(uuid.uuid4())
        s3_key = f"recordings/{call_id}.mp3"
        job_name = f"job_{call_id}"

        try:
            print(f"Uploading {local_path} to S3...")
            s3_uri = self.s3.upload_local_file(local_path, s3_key)

            print(f"Starting AWS Transcribe job: {job_name}")
            self.transcribe.start_job(job_name, s3_uri)

            return {
                "status": "success",
                "call_id": call_id,
                "job_name": job_name,
                "s3_uri": s3_uri
            }

        except botocore.exceptions.ClientError as e:
            error_code = e.response['Error']['Code']
            error_msg = e.response['Error']['Message']
            if error_code == "BadRequestException" and "empty" in error_msg.lower():
                raise HTTPException(status_code=400, detail="Audio file is empty.")
            raise HTTPException(status_code=502, detail=f"AWS Error: {error_msg}")

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")

    # ── GET TRANSCRIPT RESULT ─────────────────────────────────────────────────

    async def get_transcript_result(self, job_name: str):
        job_info = self.transcribe.get_job_result(job_name)
        if job_info["status"] == "COMPLETED":
            text = await self.transcribe.download_transcript_with_speakers(job_info["url"])
            return {"status": "COMPLETED", "transcript": text}
        return {"status": job_info["status"]}

    # ── LIST JOBS ─────────────────────────────────────────────────────────────

    def list_jobs(self, limit: int = 10):
        return self.transcribe.list_recent_jobs(limit=limit)

    # ── BACKGROUND TASK — AUTO PROCESS TRANSCRIPT + AI ────────────────────────

    @staticmethod
    async def process_transcript_background(
        call_id: str,
        job_name: str,
        max_attempts: int = 20,
        poll_interval: int = 10,
    ) -> None:
        """
        Background task launched after recording webhook.
        Polls AWS every 10 seconds until job completes.
        Downloads transcript with speaker labels + runs AI analysis.
        Saves everything to DB automatically.
        Max wait: 20 × 10s = ~3 minutes.
        """
        print(f"🔄 Background task started — call_id={call_id}, job={job_name}")

        transcribe_client = TranscribeClient()
        transcript_data = None

        # ── Poll AWS until job completes ──────────────────────────
        for attempt in range(1, max_attempts + 1):
            await asyncio.sleep(poll_interval)

            try:
                job_info = transcribe_client.get_job_result(job_name)
                aws_status = job_info.get("status")
                print(f"🔄 Attempt {attempt}/{max_attempts} — AWS status: {aws_status}")

                if aws_status == "COMPLETED":
                    transcript_data = await transcribe_client.download_transcript_with_speakers(
                        job_info["url"]
                    )

                    # ── Guard: function returned None or empty ────────────────
                    if not transcript_data:
                        print(f"⚠️ download_transcript_with_speakers returned None — retrying")
                        continue

                    print(f"✅ Transcript downloaded — {len(transcript_data.get('segments', []))} segments")
                    break

                elif aws_status == "FAILED":
                    print(f"❌ AWS Transcribe job failed: {job_name}")
                    await TranscribeService._update_analysis_status(call_id, "failed")
                    return

            except Exception as e:
                print(f"⚠️ Poll attempt {attempt} error: {type(e).__name__}: {e}")
                continue

        # ── Timed out — no result after max attempts ──────────────
        if not transcript_data:
            print(f"⏰ Background task timed out after {max_attempts} attempts — {job_name}")
            await TranscribeService._update_analysis_status(call_id, "failed")
            return

        # ── Save transcript + run AI ──────────────────────────────
        await TranscribeService._save_transcript_and_insights(
            call_id=call_id,
            transcript_data=transcript_data,
        )

    # ── SAVE TRANSCRIPT + AI INSIGHTS TO DB ──────────────────────────────────

    @staticmethod
    async def _save_transcript_and_insights(
        call_id: str,
        transcript_data: dict,
    ) -> None:
        """
        Opens its own DB session.
        Saves transcript + runs AI analysis + saves insights to DB.
        """
        from sqlalchemy.future import select
        from app.models.base import CallAnalysis
        from app.services.llm_service import LLMService

        db_gen = get_session()
        db = await db_gen.__anext__()

        try:
            # Fetch CallAnalysis record
            result = await db.execute(
                select(CallAnalysis).where(
                    CallAnalysis.call_id == UUID(call_id)
                )
            )
            analysis = result.scalars().first()

            if not analysis:
                print(f"❌ CallAnalysis not found for call_id={call_id}")
                return

            # ── Step 1: Save transcript ───────────────────────────
            analysis.transcript           = transcript_data.get("plain_text")
            analysis.transcript_json      = transcript_data.get("segments")
            analysis.transcription_status = "completed"
            analysis.updated_at           = datetime.utcnow()
            print(f"✅ Transcript saved to DB")

            # ── Step 2: Run AI analysis ───────────────────────────
            segments = transcript_data.get("segments", [])
            if segments:
                try:
                    # Fetch campaign's prompt override + metadata for role anchoring
                    from app.models.base import Call, CampaignSettings, Campaign, User, Lead
                    prompt_override = None
                    agent_name = ""
                    customer_name = ""
                    campaign_name = ""
                    call_duration_str = ""

                    call_result = await db.execute(
                        select(Call).where(Call.call_id == UUID(call_id))
                    )
                    call_row = call_result.scalars().first()
                    if call_row:
                        if call_row.campaign_id:
                            cs_result = await db.execute(
                                select(CampaignSettings).where(
                                    CampaignSettings.campaign_id == call_row.campaign_id
                                )
                            )
                            cs = cs_result.scalars().first()
                            if cs and cs.summary_prompt_override:
                                prompt_override = cs.summary_prompt_override

                            camp_result = await db.execute(
                                select(Campaign).where(Campaign.campaign_id == call_row.campaign_id)
                            )
                            camp = camp_result.scalars().first()
                            if camp:
                                campaign_name = camp.name or ""

                        user_result = await db.execute(
                            select(User).where(User.user_id == call_row.user_id)
                        )
                        user_row = user_result.scalars().first()
                        if user_row:
                            agent_name = user_row.full_name or ""

                        if call_row.lead_id:
                            lead_result = await db.execute(
                                select(Lead).where(Lead.lead_id == call_row.lead_id)
                            )
                            lead_row = lead_result.scalars().first()
                            if lead_row and lead_row.name:
                                customer_name = lead_row.name
                        if not customer_name and call_row.destination:
                            customer_name = call_row.destination

                        if call_row.duration:
                            call_duration_str = (
                                f"{call_row.duration // 60:02d}:{call_row.duration % 60:02d}"
                            )

                    analysis.summary_status = "generating"
                    await db.flush()

                    llm = LLMService(model="quality")
                    insights = await llm.analyze_call(
                        segments,
                        prompt_override=prompt_override,
                        agent_name=agent_name,
                        customer_name=customer_name,
                        campaign_name=campaign_name,
                        call_duration=call_duration_str,
                    )

                    if not isinstance(insights, dict):
                        print(f"⚠️ AI returned unexpected type: {type(insights)} — skipping")
                        analysis.summary_status = "failed"
                    else:
                        analysis.summary_sections    = insights.get("summary_sections")
                        analysis.summary_status      = insights.get("summary_status", "failed")
                        analysis.prompt_version_used = insights.get("prompt_version_used")
                        analysis.summary             = insights.get("summary")
                        analysis.sentiment           = insights.get("sentiment")
                        analysis.key_points          = insights.get("key_points")
                        analysis.next_action         = insights.get("next_action")
                        analysis.updated_at          = datetime.utcnow()
                        print(f"✅ AI insights saved — status: {analysis.summary_status}, version: {analysis.prompt_version_used}")

                except Exception as e:
                    print(f"⚠️ AI analysis failed: {type(e).__name__}: {e}")
                    analysis.summary_status = "failed"
            else:
                print("⚠️ Empty transcript — skipping AI analysis")

            await db.commit()
            print(f"✅ Background task complete for call_id={call_id}")

        except Exception as e:
            print(f"❌ Background task DB error: {type(e).__name__}: {e}")
            await db.rollback()

        finally:
            await db.close()

    # ── UPDATE ANALYSIS STATUS ────────────────────────────────────────────────

    @staticmethod
    async def _update_analysis_status(call_id: str, status: str) -> None:
        """
        Updates only transcription_status.
        Used for failed jobs and timeout cases.
        """
        from sqlalchemy.future import select
        from app.models.base import CallAnalysis

        db_gen = get_session()
        db = await db_gen.__anext__()

        try:
            result = await db.execute(
                select(CallAnalysis).where(
                    CallAnalysis.call_id == UUID(call_id)
                )
            )
            analysis = result.scalars().first()

            if analysis:
                analysis.transcription_status = status
                analysis.updated_at = datetime.utcnow()
                await db.commit()
                print(f"⚠️ Analysis status updated to '{status}' for call_id={call_id}")

        except Exception as e:
            print(f"❌ Failed to update analysis status: {e}")
            await db.rollback()

        finally:
            await db.close()