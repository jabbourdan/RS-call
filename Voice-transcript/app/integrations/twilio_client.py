from app.core.config import settings

from twilio.rest import Client


class TwilioClient:
    """
    Twilio wrapper that behaves like your working example script:

    - Reads `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` directly from `os.environ`
    - Uses `FROM_NUMBER` from the environment for the `from_` field
    - Uses `url="http://demo.twilio.com/docs/voice.xml"` for the call,
      just like the Twilio quickstart sample
    """

    def __init__(self) -> None:
        account_sid = settings.TWILIO_ACCOUNT_SID
        auth_token = settings.TWILIO_AUTH_TOKEN

        # You can keep using FROM_NUMBER from your .env / shell
        from_number = settings.FROM_NUMBER

        # Debug print (safe enough for local dev)
        print("Twilio config in backend:")
        print(f"  ACCOUNT_SID: {account_sid}")
        print(f"  AUTH_TOKEN: {auth_token}...")
        print(f"  FROM_NUMBER: {from_number}")
    
        self.client = Client(account_sid, auth_token)
        self.from_number = from_number

    # def create_test_call(self, to_number: str, message: str | None = None):
    #     """
    #     Create an outbound call using Twilio in the same way
    #     as your working example script.
    #     """
    #     print("Creating Twilio call with (os.environ-based):")
    #     print(f"  to: {to_number}")
    #     print(f"  from: {self.from_number}")

    #     # Match the Twilio sample: use the demo URL
    #     call = self.client.calls.create(
    #         url="http://demo.twilio.com/docs/voice.xml",
    #         to=to_number,
    #         from_=self.from_number,
    #     )

    #     return call
    
    def create_test_call(self, to_number: str):
        call = self.client.calls.create(
            url=f"{settings.BASE_URL}/api/v1/calls/voice",
            to=to_number,
            from_=self.from_number,
            status_callback=f"{settings.BASE_URL}/api/v1/calls/webhook",
            status_callback_method="POST",
            status_callback_event=["completed"]
        )
        return call

