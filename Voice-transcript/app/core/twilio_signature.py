"""Twilio request signature validation — FastAPI dependency.

In production (`ENV=prod`), an invalid / missing `X-Twilio-Signature` header
returns 403. In development (`ENV=dev`), the check logs and passes so that
local testing via Swagger, curl, or an ngrok URL whose hostname differs from
what Twilio signed (e.g., proxied through localtunnel) is not blocked.
"""
import logging
from fastapi import HTTPException, Request
from twilio.request_validator import RequestValidator

from app.core.config import settings

logger = logging.getLogger(__name__)


async def verify_twilio_signature(request: Request) -> None:
    signature = request.headers.get("X-Twilio-Signature", "")
    # Twilio signs the full public URL + sorted POST params.
    url = str(request.url)
    form = await request.form()
    params = {k: v for k, v in form.multi_items()}

    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    valid = validator.validate(url, params, signature)

    if valid:
        return

    if settings.ENV != "prod":
        logger.warning(
            "Twilio signature mismatch — skipping in ENV=%s (url=%s, has_sig=%s)",
            settings.ENV, url, bool(signature),
        )
        return

    raise HTTPException(status_code=403, detail="Invalid Twilio signature")
