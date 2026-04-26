# apps/api/CLAUDE.md

Orientation doc for future Claude (or human) contributors working on the
Velocity backend. The frontend has its own `CLAUDE.md` at the repo root —
read that first if you're new to the project.

## What this is

A small **Python + FastAPI** service that backs the Velocity OS frontend.
Phase 1 ships a typed CRUD surface over the same entities `src/data/seed.js`
exposes, so the frontend can swap from local seed to live API without
changing its mental model.

The intent is to keep the API narrow and PRD-driven — every endpoint
should have a clear consumer in `src/pages/*.jsx` or be staged for Phase
2 (RAG, multi-agent strategy debate, real Anthropic SDK calls).

## Stack

- **FastAPI 0.115+** — typed routes, automatic OpenAPI at `/docs`
- **SQLAlchemy 2.0** — `Mapped[...]` style declarative
- **Pydantic 2** — schemas with `from_attributes=True` and a camelCase
  alias generator so the wire shape matches the frontend
- **SQLite** for dev (zero-config), **Postgres** for prod via
  `VELOCITY_API_DATABASE_URL`
- **Anthropic SDK 0.39+** — wired as a dep, no calls yet (Phase 2)
- **uvicorn** for the HTTP server, both dev and Cloud Run

No async ORM yet. SQLAlchemy sync sessions inside FastAPI's threadpool are
plenty for the demo's read-heavy workload; flip to `AsyncSession` if a
real high-traffic endpoint shows up.

## Where things live

```
apps/api/
├── velocity_api/
│   ├── __init__.py        package + version
│   ├── settings.py        env-driven Pydantic settings (DB URL, CORS, etc.)
│   ├── db.py              SQLAlchemy engine + session + get_db dep
│   ├── models.py          ORM models — IDs match seed.js shape
│   ├── schemas.py         Pydantic shapes; camelCase via alias generator
│   ├── seed_data.py       (Phase 1) Python literal mirror of seed.js
│   ├── app.py             FastAPI app assembly + lifespan + CORS
│   └── routes/
│       ├── objectives.py  Full CRUD: GET/POST/PATCH/DELETE on objectives
│       ├── catalog.py     Read-only: company / departments / projects /
│       │                  decisions / knowledge-sources
│       └── knowledge.py   Knowledge Center: domains + overview aggregate
├── tests/                 pytest happy-path coverage
├── requirements.txt       runtime deps
├── requirements-dev.txt   pytest / httpx / ruff
├── Dockerfile             Cloud Run image (port 8080)
└── DESIGN.md              Phase 1 decisions + Phase 2 roadmap
```

## Conventions

### Naming

- ORM models in `models.py` use `snake_case` Python attribute names with
  `Mapped[...]`. Pydantic schemas in `schemas.py` keep the same names —
  the camelCase alias generator handles the wire conversion.
- IDs are short stable strings matching the existing seed: `obj-1`,
  `kr-1-2`, `proj-3`, `ks-1`, `kd-cmf`, `d-1`. New rows generated at
  runtime use `schemas.make_id(prefix)` → `f"{prefix}-{uuid4().hex[:10]}"`.
- Status / scope enums stay as plain strings (mirroring seed). Don't
  introduce SQLAlchemy `Enum` unless we need DB-level validation.

### Wire shape

- Camel: `linkedProjects`, `keyResults`, `departmentId` on the wire;
  `linked_projects`, `key_results`, `department_id` in Python.
- Pydantic models inherit `_CamelModel` from `schemas.py` which sets the
  alias generator + `populate_by_name=True`. Both shapes are accepted on
  input; output uses the alias.

### Routes

- One route module per resource family. Group `objectives` separately
  because of nested KR semantics; pile read-only catalog endpoints into
  `catalog.py`.
- Use `Depends(get_db)` for the session — never instantiate `SessionLocal`
  inside a route. Tests override `get_db` via `app.dependency_overrides`.
- Errors raise `HTTPException` with a stable `detail` slug
  (`objective_not_found`, `domain_not_found`); HTTP status is the source
  of truth and the slug helps the frontend localize.
- Pagination is unimplemented — every catalog list is well under 100 rows
  in the demo. Add `?limit=&offset=` only when something hits 200+.

### CRUD pattern

Mirror the frontend's pattern — full CRUD only when a page edits the
entity; everything else is GET-only until a writer arrives.

```python
@router.get("")              -> list
@router.get("/{id}")         -> single (404 if missing)
@router.post("")             -> create (201; 409 if id taken)
@router.patch("/{id}")       -> partial update (only `exclude_unset` fields)
@router.delete("/{id}")      -> 204
```

Nested arrays (e.g. KRs under an Objective) replace wholesale on PATCH
but reuse rows by id to preserve identity. See
`routes/objectives.update_objective` for the canonical implementation.

### Seed loader

`velocity_api/seed_data.py` is a Python literal mirror of the entities
that need backend representation. **Drift is the chief risk.** Until we
add a JSON-snapshot diff guard (queued for Phase 2), the rule is:

> If you change one of these entities in `src/data/seed.js`, mirror the
> change in `apps/api/velocity_api/seed_data.py` in the same commit.

Entities currently mirrored: `Company`, `Departments`, `Objectives` (with
`KRs`), `Projects`, `DecisionsRich`, `KnowledgeDomains`, `KnowledgeSources`.

The loader runs at app startup if `VELOCITY_API_AUTO_SEED=true` (default)
**and** the DB looks empty. Cloud Run's ephemeral disk means the SQLite DB
resets each cold start, which is the desired demo behavior.

## Running locally

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn velocity_api.app:app --reload --port 8081
# OpenAPI: http://localhost:8081/docs
# Health:  http://localhost:8081/healthz
```

Frontend talks to `http://localhost:8081` once it's wired (Phase 2). For
now you can poke the API with curl or the auto-generated Swagger UI.

## Testing

```bash
pytest -q                       # happy-path coverage
ruff check velocity_api tests   # lint (matches what CI runs)
```

Tests use FastAPI's `TestClient` (which is httpx under the hood) plus an
in-memory SQLite (`sqlite://`). Each test gets a fresh schema via the
`db` fixture in `tests/conftest.py` — no shared state between tests.

When you add an endpoint, add at least one happy-path test in
`tests/test_<resource>.py`. If the endpoint mutates state, also add a
404-or-409 test.

## Deployment

**Unified single Cloud Run service** (`velocity2`). The repo's root
`Dockerfile` is a 2-stage build:

1. `node:20-alpine` runs `npm ci && npm run build` to produce `dist/`.
2. `python:3.11-slim` installs `apps/api/requirements.txt`, copies the
   `velocity_api` package, and copies the SPA's `dist/` into `./static/`.

`velocity_api/app.py` mounts that `static/` directory after the API
routers. A custom catch-all returns `index.html` for unknown paths so
the frontend's state-based routing handles deep links the way nginx
used to. `GZipMiddleware` + a cache-control middleware reproduce the
old nginx.conf headers (immutable for `/assets/*`, no-cache for
`index.html`).

`cloudbuild.yaml` deploys the unified image with no per-service
parallelism — same flow as before:

```
build → push → gcloud run deploy velocity2 → playwright e2e against $_BASE_URL
```

The container listens on `$PORT` (Cloud Run convention), defaulting to
8080. CORS allowlist in `settings.py` covers the dev server (5173/5174)
and the deployed frontend URL. In the unified deploy CORS isn't strictly
needed (same origin) but staying permissive avoids surprise breakage if
we ever split back into two services.

Decision history for this approach: see `DESIGN.md` § "2026-04-26 —
Decision 8 overturned: unified single-service deploy".

## Things to NOT do

- **Don't add async ORM** — sync sessions are plenty for the demo, and
  AsyncSession adds friction in tests.
- **Don't add a router framework on top of FastAPI** — its native
  `APIRouter` covers what we need.
- **Don't introduce a service layer** — Phase 1 routes can call ORM
  directly. When a route grows past ~80 lines, factor a `services/` helper.
- **Don't add Anthropic SDK calls in Phase 1.** The dep is wired so the
  Phase 2 step is a small diff, not a stack expansion.
- **Don't bulk-fix the frontend** to call the API — that's Phase 2 step 1
  and is its own coordinated effort.
- **Don't introduce English-only seed entries** — keep the Beihai voice.

## Phase status (last updated alongside this commit)

| | Phase 1 ✅ shipped | Phase 2 (queued) |
|---|---|---|
| **CRUD** | Objectives + KRs full CRUD; KnowledgeDomain PATCH; everything else read-only | Project / Decision / KnowledgeSource writes |
| **AI** | Anthropic SDK as a dep, no calls | Chat endpoint with prompt caching; multi-agent debate orchestration |
| **RAG** | None | pgvector + document parser + embedding service |
| **Auth** | None (public Cloud Run) | `X-User-Id` header → real OAuth / JWT |
| **Frontend wiring** | None — frontend still reads `seed.js` | `useApi(...)` hook; per-page cutover |
| **Deploy** | Unified Cloud Run service (root `Dockerfile` ships both FE bundle and API) | Optional split when scaling needs diverge |
| **Tests** | pytest happy-path: 18 specs covering health / objectives / catalog / knowledge | + integration tests against a live preview deploy |

See `DESIGN.md` for the rationale behind these scoping calls and the
follow-up entry overturning the original "separate service" deploy plan.
