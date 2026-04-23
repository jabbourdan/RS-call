"""Generate the default Hebrew inbound greeting MP3 and upload it to S3.

Usage from the Voice-transcript/ dir:

    source venv/bin/activate
    python -m scripts.generate_hebrew_greeting

Or override the text:

    python -m scripts.generate_hebrew_greeting --text "..." --voice Hila

Afterwards, set the printed public URL as INBOUND_GREETING_HE_AUDIO_URL in
Voice-transcript/.env and restart uvicorn.

Why this exists: Twilio's <Say> has no Hebrew TTS voice in any of its engines
(Polly / Google / ElevenLabs). We bypass Twilio TTS entirely and <Play> a
pre-synthesized MP3 that we generate with AWS Polly directly.
"""
import argparse
import sys
from pathlib import Path

import boto3

# Allow running as `python scripts/generate_hebrew_greeting.py` OR as a module.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.core.config import settings  # noqa: E402


DEFAULT_TEXT = "תודה שהתקשרתם, ניצור איתך קשר בקרוב"
DEFAULT_VOICE = "Hila"       # Hebrew (neural only). Set --voice to override.
DEFAULT_ENGINE = "neural"
DEFAULT_S3_KEY = "inbound-greetings/default_he.mp3"


def synthesize_mp3(text: str, voice: str, engine: str) -> bytes:
    polly = boto3.client(
        "polly",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    resp = polly.synthesize_speech(
        Text=text,
        OutputFormat="mp3",
        VoiceId=voice,
        Engine=engine,
    )
    return resp["AudioStream"].read()


def upload_to_s3(audio_bytes: bytes, s3_key: str, make_public: bool) -> str:
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    extra = {"ContentType": "audio/mpeg"}
    if make_public:
        extra["ACL"] = "public-read"

    s3.put_object(
        Bucket=settings.AWS_S3_BUCKET,
        Key=s3_key,
        Body=audio_bytes,
        **extra,
    )

    return (
        f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--text", default=DEFAULT_TEXT, help="Greeting text (Hebrew).")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="Polly voice id (e.g., Hila).")
    parser.add_argument("--engine", default=DEFAULT_ENGINE, choices=["neural", "standard"])
    parser.add_argument("--key", default=DEFAULT_S3_KEY, help="S3 object key.")
    parser.add_argument(
        "--no-public",
        action="store_true",
        help="Skip public-read ACL (use when your bucket blocks public ACLs; "
        "you'll need a bucket policy or CloudFront to serve the MP3).",
    )
    parser.add_argument(
        "--save-local",
        metavar="PATH",
        help="Also save the MP3 to this local path for inspection.",
    )
    args = parser.parse_args()

    print(f"▶ Synthesizing with Polly — voice={args.voice}, engine={args.engine}")
    audio = synthesize_mp3(args.text, args.voice, args.engine)
    print(f"  ✓ {len(audio):,} bytes of MP3")

    if args.save_local:
        Path(args.save_local).write_bytes(audio)
        print(f"  ✓ saved local copy → {args.save_local}")

    print(f"▶ Uploading → s3://{settings.AWS_S3_BUCKET}/{args.key}")
    try:
        url = upload_to_s3(audio, args.key, make_public=not args.no_public)
    except Exception as e:
        print(f"  ✗ upload failed: {type(e).__name__}: {e}")
        if "AccessControlList" in str(e) or "AccessDenied" in str(e):
            print(
                "\n  Hint: your bucket probably has 'Block Public Access' turned on.\n"
                "  Re-run with --no-public, then serve the object via a bucket policy\n"
                "  or a CloudFront distribution."
            )
        sys.exit(1)

    print(f"  ✓ uploaded")
    print()
    print("=" * 78)
    print("Public URL:")
    print(f"  {url}")
    print()
    print("Next steps:")
    print(f"  1. Add to Voice-transcript/.env:")
    print(f"       INBOUND_GREETING_HE_AUDIO_URL={url}")
    print(f"  2. Restart uvicorn.")
    print(f"  3. Test: curl the /inbound-voice endpoint — the TwiML should use <Play>.")
    print("=" * 78)


if __name__ == "__main__":
    main()
