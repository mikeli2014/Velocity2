"""SQLAlchemy engine + session bootstrap.

The engine is created once at import time from settings.database_url. SQLite
needs ``check_same_thread=False`` so FastAPI's threadpool can share the
connection. Postgres needs no special args.

``get_db`` is a FastAPI dependency that yields a session and closes it on
request teardown. Tests replace this dependency via ``app.dependency_overrides``.
"""

from __future__ import annotations

import os
from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .settings import settings


class Base(DeclarativeBase):
    """Common base for all ORM models."""


def _make_engine(url: str):
    if url.startswith("sqlite:///"):
        # Ensure the parent directory exists for file-backed SQLite.
        path = url.replace("sqlite:///", "", 1)
        if path and path not in (":memory:",):
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        return create_engine(url, connect_args={"check_same_thread": False})
    return create_engine(url, pool_pre_ping=True)


# Tests can override DATABASE_URL via env before import.
_url = os.environ.get("VELOCITY_API_DATABASE_URL", settings.database_url)
engine = _make_engine(_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Iterator[Session]:
    """FastAPI dependency that yields a session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all() -> None:
    """Create all tables. Phase 1 uses this in lieu of Alembic migrations
    since the schema is small and the dev DB is disposable."""
    # Importing models here ensures they're registered with Base.metadata
    # before create_all runs. Avoids a circular import at module load time.
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
