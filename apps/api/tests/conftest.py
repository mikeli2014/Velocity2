"""Pytest fixtures.

Each test gets a fresh in-memory SQLite DB with the seed loaded. The
``client`` fixture overrides FastAPI's ``get_db`` dependency to use the
test session and yields a ``TestClient`` that wraps the app.

Tests don't run the lifespan (so the auto-seed-on-startup logic doesn't
double-fire); the ``db`` fixture seeds explicitly via ``load_seed``.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from velocity_api.app import app
from velocity_api.db import Base, get_db
from velocity_api.seed_data import load_seed


@pytest.fixture()
def db():
    # Shared in-memory SQLite using StaticPool keeps every connection on
    # the same in-process database.
    from sqlalchemy.pool import StaticPool

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = TestSession()
    load_seed(session)
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture()
def client(db):
    def _override():
        try:
            yield db
        finally:
            pass  # session lifecycle handled by the `db` fixture

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
