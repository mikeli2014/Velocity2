"""Runtime configuration loaded from env vars / .env.

Defaults aim at zero-config local dev: SQLite file under ``./.data/`` and
permissive CORS for the Vite dev server. Production is expected to set
``DATABASE_URL`` to a Postgres URL and ``ALLOWED_ORIGINS`` to the deployed
frontend URL.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="VELOCITY_API_",
        extra="ignore",
    )

    # DB. SQLite default keeps the dev experience friction-free; switch to
    # Postgres in Cloud Run via VELOCITY_API_DATABASE_URL=postgresql+psycopg://...
    database_url: str = "sqlite:///./.data/velocity.db"

    # When True, the app populates the DB from seed_data.py on startup if it
    # looks empty. Useful for dev + Cloud Run (ephemeral disk on Cloud Run
    # means the DB resets each cold start anyway, which is fine for the demo).
    auto_seed: bool = True

    # Comma-separated list of allowed CORS origins. The Vite dev server runs
    # on :5173 and the Cloud Run preview host is the second default entry —
    # update via env in deploys.
    allowed_origins: str = (
        "http://localhost:5173,"
        "http://localhost:5174,"
        "http://localhost:8080,"
        "https://velocity2-802659517720.us-east1.run.app"
    )

    # Reserved for Phase 2 (Anthropic SDK calls). Reads ANTHROPIC_API_KEY too
    # because the Anthropic SDK auto-detects that variable.
    anthropic_api_key: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
