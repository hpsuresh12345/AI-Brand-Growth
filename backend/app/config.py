"""
Application settings via Pydantic Settings.

Loads configuration from environment variables and .env file.
Single source of truth for all app-wide config values.
"""

import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from .env file."""

    # App
    app_name: str = "AI Real Estate Lead Conversion Engine"
    app_env: str = "development"
    debug: bool = True

    # Anthropic
    anthropic_api_key: str = ""

    # Database
    database_url: str = "sqlite:///./lead_engine.db"
    
    # JWT Authentication
    jwt_secret_key: str = "your-secret-key-change-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours
    
    # Security
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    rate_limit_per_minute: int = 60

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
