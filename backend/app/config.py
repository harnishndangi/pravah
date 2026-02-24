"""Application configuration module.

Loads settings from environment variables using pydantic-settings.
Google Python Style Guide compliant.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Attributes:
        app_name: Human-readable name of the application.
        app_version: Semantic version string.
        env: Deployment environment (development/production).
        model_path: Filesystem path to the serialized model artifact.
        allowed_origins: Comma-separated list of CORS-allowed origins.
        debug: Whether to enable debug mode.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Pravah — Navi Mumbai House Price Predictor"
    app_version: str = "1.0.0"
    env: str = "production"
    model_path: str = "model.pkl"
    allowed_origins: str = (
        "http://localhost:3000,"
        "https://pravah-house-price.vercel.app,"
        "https://*.vercel.app"
    )
    debug: bool = False

    @property
    def origins_list(self) -> list[str]:
        """Returns parsed list of allowed CORS origins."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Returns a cached Settings singleton instance."""
    return Settings()
