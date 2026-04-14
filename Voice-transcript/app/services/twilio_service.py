from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant

from app.core.config import settings
from app.integrations.twilio_client import TwilioClient


class TwilioService:
    def __init__(self) -> None:
        self.twilio = TwilioClient()

    # ── OUTBOUND CALL (existing) ──────────────────────────────────

    def create_call(self, to_number: str) -> dict:
        target_number = to_number or settings.TO_NUMBER
        call = self.twilio.create_test_call(target_number)
        return {
            "sid": call.sid,
            "status": call.status,
            "to": call.to,
            "from": call.from_,
        }

    # ── GENERATE BROWSER ACCESS TOKEN ─────────────────────────────

    def generate_access_token(self, agent_identity: str) -> dict:
        """
        Generates a short-lived Twilio Access Token for browser-based calling.

        The frontend uses this token to:
        - Register as a Twilio device
        - Make and receive calls from the browser
        - Connect browser audio to Twilio

        agent_identity: unique identifier for the agent (e.g. user_id or email)
        """
        print(f"ACCOUNT_SID:    {settings.TWILIO_ACCOUNT_SID}")
        print(f"API_KEY:        {settings.TWILIO_API_KEY}")
        print(f"API_SECRET:     {settings.TWILIO_API_SECRET[:6]}...")
        print(f"TWIML_APP_SID:  {settings.TWILIO_TWIML_APP_SID}")

        # Create Access Token using API Key credentials
        token = AccessToken(
            account_sid=settings.TWILIO_ACCOUNT_SID,
            signing_key_sid=settings.TWILIO_API_KEY,
            secret=settings.TWILIO_API_SECRET,
            identity=agent_identity,
            ttl=3600,   # token expires in 1 hour
        )

        # Add Voice grant — allows browser to make/receive calls
        voice_grant = VoiceGrant(
            outgoing_application_sid=settings.TWILIO_TWIML_APP_SID,
            incoming_allow=True,    # allow incoming calls to browser
        )
        token.add_grant(voice_grant)

        return {
            "token": token.to_jwt(),
            "identity": agent_identity,
            "expires_in": 3600,
        }