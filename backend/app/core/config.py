"""
Application Configuration — reads from .env
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "TBI Clinic AI Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o"
    AZURE_OPENAI_API_VERSION: str = "2024-02-01"

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = ""
    S3_ENCRYPTION: str = "AES256"

    # Email
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@tbiclinic.com"

    # Security
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    BCRYPT_ROUNDS: int = 12
    MFA_ISSUER: str = "TBI Clinic Platform"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()