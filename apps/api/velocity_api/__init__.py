"""Velocity OS — backend API package.

Entry point: ``velocity_api.app:app`` (FastAPI instance). Run with::

    uvicorn velocity_api.app:app --reload --port 8081

The package is intentionally narrow in Phase 1: a typed CRUD surface over
the same entities the frontend currently keeps in ``src/data/seed.js``.
RAG / Anthropic SDK calls land in Phase 2.
"""

__version__ = "0.1.0"
