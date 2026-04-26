"""FastAPI app assembly.

Single Cloud Run service serves both the API and the built React SPA:

- ``/api/v1/*``                  routed first (objectives, catalog, knowledge)
- ``/healthz``                   plain-text liveness for Cloud Run probes
- ``/api/v1/health``             detailed JSON health (DB type, version, row counts)
- ``/{static_path:path}``        serves files from ``static/`` if they exist;
                                 unknown paths fall through to ``index.html``
                                 so React Router-style deep links work.

Cache-control + gzip mirror what the previous nginx.conf provided so the
existing Playwright smoke specs continue to pass.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, PlainTextResponse, Response
from sqlalchemy import inspect

from . import __version__, models, seed_data
from .db import SessionLocal, create_all, engine
from .routes import catalog, knowledge, objectives
from .schemas import HealthOut
from .settings import settings

# Where the frontend's built bundle is copied inside the container. The
# Dockerfile drops ``dist/`` here. In dev (no static dir present) the SPA
# routes simply 404 — that's fine, you'd be running ``npm run dev`` on
# :5173 anyway.
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Create tables, then top up the DB with any seed rows it's missing.

    `load_seed` is idempotent (per-row `db.get` checks) so it's safe to
    run on every startup — and that means newly added seed entities
    auto-populate without manually wiping ``.data/velocity.db``.
    """
    create_all()
    if settings.auto_seed:
        with SessionLocal() as db:
            inserted = seed_data.load_seed(db)
            total = sum(inserted.values())
            if total:
                print(f"[velocity-api] seeded {total} rows: {inserted}")
    yield


app = FastAPI(
    title="Velocity OS API",
    version=__version__,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
)

# Compress text payloads above 1KB.
app.add_middleware(GZipMiddleware, minimum_size=1024)

# CORS — only matters when the frontend runs on a different origin (dev
# server on :5173). Same-origin (the unified deploy) doesn't need it but
# the middleware is harmless there.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Cache headers (replaces nginx.conf behavior) -----------------------


@app.middleware("http")
async def cache_control(request, call_next):
    response = await call_next(request)
    path = request.url.path
    # Vite emits /assets/index-<hash>.{js,css} — content-addressed, safe
    # for a year-long cache.
    if path.startswith("/assets/"):
        response.headers["Cache-Control"] = "public, immutable, max-age=31536000"
    # Index HTML must always re-fetch so deploys roll out immediately.
    elif path in ("/", "/index.html"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


# --- Health -------------------------------------------------------------


@app.get("/healthz", response_class=PlainTextResponse, include_in_schema=False)
async def healthz():
    return "ok\n"


@app.get("/api/v1/health", response_model=HealthOut, tags=["meta"])
def health():
    dialect = inspect(engine).dialect.name
    with SessionLocal() as db:
        objective_count = db.query(models.Objective).count()
    return HealthOut(
        status="ok",
        version=__version__,
        database=dialect,
        objective_count=objective_count,
    )


# --- API routers --------------------------------------------------------

app.include_router(objectives.router)
app.include_router(catalog.router)
app.include_router(knowledge.router)


# --- Static SPA fallback ------------------------------------------------
# Defined LAST so /api/* + /healthz + /api/openapi.json win first.


@app.get("/{static_path:path}", include_in_schema=False)
async def spa_fallback(static_path: str):
    """Serve files from static/ if they exist, else fall through to
    index.html so React's state-based routing handles deep links.
    """
    if not STATIC_DIR.exists():
        # Dev mode (no built bundle baked in) — make this obvious.
        return Response(
            status_code=404,
            content=(
                "no static bundle present. run `npm run build` and rebuild "
                "the Docker image, or use the Vite dev server on :5173."
            ),
            media_type="text/plain",
        )
    candidate = STATIC_DIR / static_path
    if candidate.is_file():
        return FileResponse(candidate)
    index = STATIC_DIR / "index.html"
    if index.is_file():
        return FileResponse(index, media_type="text/html")
    return Response(status_code=404, content="not found", media_type="text/plain")
