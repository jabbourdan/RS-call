import boto3
import httpx
from app.core.config import settings


class TranscribeClient:

    def __init__(self):
        self.client = boto3.client(
            'transcribe',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

    # ── START JOB ─────────────────────────────────────────────────────────────

    def start_job(self, job_name: str, s3_uri: str, expected_speakers: int = 2):
        """
        Starts an AWS Transcribe job with speaker diarization enabled.
        spk_0 = Agent (first to speak), spk_1 = Client
        """
        return self.client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': s3_uri},
            MediaFormat='mp3',
            LanguageCode='he-IL',
            Settings={
                'ShowSpeakerLabels': True,
                'MaxSpeakerLabels': expected_speakers,
            }
        )

    # ── GET JOB RESULT ────────────────────────────────────────────────────────

    def get_job_result(self, job_name: str):
        """
        Checks the status of a transcription job.
        Returns status + transcript URL if completed.
        """
        response = self.client.get_transcription_job(TranscriptionJobName=job_name)
        status = response['TranscriptionJob']['TranscriptionJobStatus']

        if status == 'COMPLETED':
            transcript_uri = response['TranscriptionJob']['Transcript']['TranscriptFileUri']
            return {"status": "COMPLETED", "url": transcript_uri}

        return {"status": status, "url": None}

    # ── LIST RECENT JOBS ──────────────────────────────────────────────────────

    def list_recent_jobs(self, limit: int = 10):
        """
        Fetches the last X completed jobs from AWS Transcribe.
        """
        response = self.client.list_transcription_jobs(
            MaxResults=limit,
        )
        return response.get('TranscriptionJobSummaries', [])

    # ── DOWNLOAD PLAIN TRANSCRIPT ─────────────────────────────────────────────

    async def download_transcript_text(self, url: str) -> str:
        """
        Downloads the AWS JSON and extracts only the plain transcript text.
        Used for simple cases where speaker separation is not needed.
        """
        print("its still the text and the full json")
        async with httpx.AsyncClient() as client:
            res = await client.get(url)
            data = res.json()
            return data['results']['transcripts'][0]['transcript']

    # ── DOWNLOAD TRANSCRIPT WITH SPEAKERS ─────────────────────────────────────

    async def download_transcript_with_speakers(self, url: str) -> dict:
        print("its the speakers for json")
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(url)
                data = res.json()

            results = data.get("results", {})
            plain_text = results["transcripts"][0]["transcript"]

            speaker_labels = results.get("speaker_labels", {})
            print(f"🔍 Speaker labels found: {bool(speaker_labels)}")
            print(f"🔍 Segments count: {len(speaker_labels.get('segments', []))}")

            # ── No speaker labels → return plain text only ────────────
            if not speaker_labels or not speaker_labels.get("segments"):
                print("⚠️ No speaker diarization — returning plain text only")
                return {
                    "plain_text": plain_text,
                    "formatted_text": plain_text,
                    "segments": [],
                }

            # ── Build word → speaker map ──────────────────────────────
            word_speaker_map = {}
            for segment in speaker_labels.get("segments", []):
                speaker = segment["speaker_label"]
                for item in segment.get("items", []):
                    start = item.get("start_time")
                    if start:
                        word_speaker_map[start] = speaker

            # ── Match words to speakers ───────────────────────────────
            segments = []
            current_speaker = None
            current_words = []

            for item in results.get("items", []):
                if item["type"] == "punctuation":
                    if current_words:
                        current_words[-1] += item["alternatives"][0]["content"]
                    continue

                start_time = item.get("start_time")
                word = item["alternatives"][0]["content"]
                speaker = word_speaker_map.get(start_time, current_speaker)

                if speaker != current_speaker:
                    if current_words and current_speaker is not None:
                        segments.append({
                            "speaker": current_speaker,
                            "text": " ".join(current_words),
                        })
                    current_speaker = speaker
                    current_words = [word]
                else:
                    current_words.append(word)

            if current_words and current_speaker is not None:
                segments.append({
                    "speaker": current_speaker,
                    "text": " ".join(current_words),
                })

            speaker_map = {"spk_0": "Agent", "spk_1": "Client"}

            formatted_lines = []
            for seg in segments:
                label = speaker_map.get(seg["speaker"], seg["speaker"])
                formatted_lines.append(f"{label}: {seg['text']}")

            formatted_text = "\n".join(formatted_lines)

            print(f"🎙️ Transcript parsed — {len(segments)} segments")
            print(f"📝 Preview:\n{formatted_text[:300]}...")

            return {
                "plain_text": plain_text,
                "formatted_text": formatted_text,
                "segments": [
                    {
                        "speaker": speaker_map.get(seg["speaker"], seg["speaker"]),
                        "text": seg["text"],
                    }
                    for seg in segments
                ],
            }

        except Exception as e:
            print(f"❌ download_transcript_with_speakers error: {type(e).__name__}: {e}")
            return {
                "plain_text": "",
                "formatted_text": "",
                "segments": [],
            }