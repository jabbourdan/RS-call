from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Twilio
    BASE_URL: str
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TO_NUMBER: str
    FROM_NUMBER: str

    # AWS
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    AWS_S3_BUCKET: str

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    TWILIO_API_KEY: str
    TWILIO_API_SECRET: str
    TWILIO_TWIML_APP_SID: str
    
    # LLM
    GROQ_API_KEY: str = ""

    # Runtime environment (dev|prod). Controls Twilio signature enforcement
    # and similar dev-only leniencies.
    ENV: str = "dev"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()