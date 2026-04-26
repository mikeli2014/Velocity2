# apps/api/DESIGN.md

Architecture decisions for the Velocity backend, captured at scaffold
time. This is the "why" companion to `CLAUDE.md` (which is the "what" /
"where"). New decisions belong at the bottom with a date and a short
rationale; don't rewrite history.

## Goals

The PRD (`docs/velocity_prd_v2_cn.md`) frames Velocity as an "Enterprise
Knowledge & Strategy Operating System". The backend's job is to make
that real — turn the frontend's local seed data into a persistent,
multi-user, AI-augmented service. Three concrete responsibilities:

1. **Persist the data** the frontend currently keeps in
   `src/data/seed.js`: company / departments / OKRs / projects / decisions
   / knowledge sources / domains / skill packs / workflows.
2. **Run AI** — RAG retrieval over knowledge sources, multi-agent
   strategy debate, skill / workflow execution against Claude.
3. **Govern access** — permissions, audit log, source traceability so
   PRD §4 / §9 governance checks have something to back them.

Phase 1 (this commit) does only #1, with #2 / #3 stubbed at the schema
level so Phase 2 is a fill-in, not a rewrite.

## Key decisions

### 1. Python + FastAPI over Node / Hono

**Decision:** Python 3.11 + FastAPI for the backend.

**Why:**
- The PRD's Phase 2 work (`documentParser` / `embeddingService` /
  `vectorStore` / `ragService` / `agentService`) is in a domain where
  Python is the dominant ecosystem — pgvector's best client is psycopg
  + SQLAlchemy, document parsers (unstructured, llama-parse) are
  Python-first, and Anthropic's Python SDK is mature with prompt caching
  support.
- FastAPI's typed routes + Pydantic schemas + auto-OpenAPI mean the
  frontend can codegen typed clients later if the API surface stabilizes.
- The frontend stays JS — boundaries are clean, no monorepo TS sharing
  required.

**Tradeoffs accepted:**
- Two languages in the repo. CLAUDE.md at root + apps/api/CLAUDE.md
  scoped to backend mitigate the cognitive overhead.
- Cold-start for Cloud Run is slower than Node/Hono. Acceptable for the
  internal demo workload; if it bites, switch the image to
  `python:3.11-slim` + uvicorn workers=1 + min-instances=1.

### 2. Sync SQLAlchemy + SQLite for dev, Postgres for prod

**Decision:** Sync `SessionLocal()`, threadpool-bounded inside FastAPI.
SQLite via stdlib `sqlite3` for dev, Postgres via `psycopg[binary]` for
prod, switched purely by `VELOCITY_API_DATABASE_URL`.

**Why:**
- Read-heavy demo workload doesn't need async DB.
- Sync sessions are vastly easier to test (no event-loop juggling in
  pytest fixtures).
- SQLite for dev removes setup friction. Postgres for prod is a
  one-env-var swap.
- pgvector lives in Postgres — using SQLAlchemy already means the Phase
  2 vector column is a simple `Vector(1536)` column type, no new ORM.

**Migration story:** Phase 1 uses `Base.metadata.create_all()` at startup;
the schema is small and the dev DB is disposable. Alembic gets added when
Phase 2 introduces nullable / non-nullable migrations on real prod data.

### 3. Mirror seed.js into seed_data.py manually

**Decision (from the brainstorm):** option D — mirror the relevant
entities into `velocity_api/seed_data.py` as Python literals, document
the "keep both in sync" rule in CLAUDE.md, and add a JSON-snapshot diff
guard in Phase 2.

**Why:**
- Single source of truth (option C — backend canonical) is the right
  end state but requires a frontend cutover that's out of scope for
  Phase 1.
- A build step that exports `seed.js → seed.json` (option B) couples the
  frontend's `npm run build` to the backend, which complicates the dev
  loop for someone touching only the frontend.
- The list of entities mirrored is small (Company, Departments,
  Objectives, Projects, Decisions, KnowledgeDomains, KnowledgeSources)
  and turns over slowly. Manual mirroring is cheap until it isn't.
- The drift guard (Phase 2) is a ~30-line script: parse `seed.js` with a
  light regex / acorn-style AST, walk the same shape in
  `seed_data.py`, diff. Cheap to add when needed.

**Risk:** drift between FE and BE seed values causes confusion when an
engineer trusts one. CLAUDE.md calls the rule out at the top, and the
Phase 2 cutover (frontend → API) eliminates the duplication entirely.

### 4. Extend `Company` schema with empty knowledge-profile fields now

**Decision:** Add `focus_areas`, `competitors`, `terminology`,
`context_prompt` JSON columns on `Company` in Phase 1, default empty.
Don't seed them yet.

**Why:**
- The PRD §5.1 / §6.1 calls these out as company-level knowledge
  context — they're part of the "公司级知识中心" concept, not just
  KnowledgeDomain.
- Adding the columns now is free; adding them later means a migration.
- Seeding them is deferred because the frontend doesn't render them yet.

### 5. Knowledge Center scope: domains + sources + overview only

**Decision:** Phase 1 ships `KnowledgeDomain` + `KnowledgeSource` +
`/knowledge/overview` aggregate. **Out of scope:** ingest queue
persistence, feedback events, knowledge-graph link table.

**Why:**
- IngestQueue is the staging area for the upload pipeline. Without the
  real document parser + embedding service (Phase 2), it's just a UI
  state machine — no reason to make it durable.
- Feedback events are part of the quality-loop the AI assistants close.
  They're orphaned without a real assistant.
- Knowledge-graph relationships are computed in the frontend today
  (KnowledgePage `KnowledgeGraph`). Promoting them to a `KnowledgeLink`
  table is meaningful only when we have automated relationship
  extraction (Phase 2 alongside RAG).

### 6. URL versioning + camelCase JSON

**Decision:** All routes prefixed `/api/v1/...`. JSON wire shape is
camelCase via Pydantic alias generator.

**Why:**
- Versioning the URL gives a clean migration path when Phase 2 adds
  breaking shapes (e.g. nested-Objective writes vs flat).
- camelCase matches the existing frontend seed.js. Without aliasing the
  frontend would need a transform layer.

### 7. Auth: skip in Phase 1, X-User-Id in Phase 2 stub, OAuth later

**Decision:** No auth in Phase 1. Phase 2 introduces an `X-User-Id`
header dependency that defaults to `陈志远` (the seeded CEO), used for
audit-log writes. Real OAuth lands when this stops being a demo.

**Why:**
- The deploy is a public Cloud Run URL today; adding auth without a
  rollout plan would block frontend wiring.
- A header stub is enough to make audit log writes meaningful in Phase
  2 without coupling to an identity provider.

### 8. Deployment: separate Cloud Run service

**Decision:** `velocity2-api` deploys as a second Cloud Run service.
Frontend gets the API URL via build-time env (`VITE_API_URL`).

**Why:**
- Independent scaling. The frontend is a static-asset CDN play; the API
  needs warm instances when AI calls land.
- Different Dockerfile, different language runtime, different metrics.
  Separate services are the idiomatic Cloud Run pattern.
- A unified hostname via Cloud Load Balancer is cleaner UX, but the
  config lives outside the repo and isn't required for the demo.

CORS allowlist in `settings.py` includes the frontend's known Cloud Run
hostname. When the API URL is known, add it to the frontend's
`vite.config.js` and rebuild — no API-side change needed.

## Phase 2 roadmap (ordered)

1. **Frontend data-layer swap** — `useApi(endpoint)` hook + per-page
   cutover from `useState(Seed)` → `useApi("/api/v1/...")`. Validates
   Phase 1 in production. Lowest-risk first move because the API surface
   is already shaped to match the existing data.
2. **Anthropic chat endpoint with prompt caching** — backs
   `AssistantChat`. Single request handler, demonstrates real LLM
   integration with the company-context system prompt.
3. **pgvector + document parser** — KnowledgeUploadFlow becomes real.
   Pipeline stages: fetch → parse (unstructured / llama-parse) →
   summarize → tag → embed → review. The IngestQueue UI then has live
   data behind it.
4. **Multi-agent strategy debate** — replace seeded `DebateMessages`
   with real Claude calls per persona. Streamed via SSE so the canvas
   shows agents producing text live.
5. **Skill / Workflow execution** — `RunDialog`'s simulated step list
   becomes real Claude chains, persisted to `WorkflowRuns`.
6. **Auth + permissions enforcement** — OAuth (probably WeCom for the
   target enterprise audience), JWT, role-based gates on routes.
7. **Cloud Build pipeline extension** — `cloudbuild.api.yaml` deploys
   the API alongside the frontend. Optional: Cloud Load Balancer for a
   single hostname.
8. **JSON-snapshot drift guard** — small script that exports
   `seed.js → seed.json` and diffs against `apps/api/seed.snapshot.json`.
   Gates CI when seed mirror gets out of sync. Or: the frontend cutover
   from #1 makes this obsolete.

## Open questions (revisit when Phase 2 starts)

- **pgvector vs Vertex AI Vector Search.** pgvector is fine for the
  demo's source count (~10s) and keeps everything in Postgres. Vertex
  becomes attractive at 100k+ chunks if cost matters. Defer.
- **Streaming:** SSE for chat / debate vs. WebSocket. SSE is simpler and
  Cloud Run supports it; WebSocket only if we add bidirectional flows.
- **Background workers:** the upload pipeline + multi-agent debate are
  long-running. Run them inline (uvicorn worker, requires extending
  Cloud Run timeout to 60min) or push to Cloud Tasks / Cloud Run Jobs?
  Inline is simpler; Tasks is more correct.
- **Anthropic prompt caching strategy:** company-context system prompt
  is the natural cache breakpoint, then per-department, then
  per-question. The skill-pack `claude-api` skill should be invoked
  when this lands.

## Follow-up decisions

### 2026-04-26 — Decision 8 overturned: unified single-service deploy

Original decision 8 above said "separate Cloud Run service for the API".
Reversed today: a **single Cloud Run service** serves both the React SPA
(built `dist/`) and the API.

**Implementation:**
- `Dockerfile` (root) is now a 2-stage build: stage 1 = `node:20-alpine`
  runs `npm ci && npm run build`; stage 2 = `python:3.11-slim` installs
  `apps/api/requirements.txt` and copies the frontend's `dist/` into
  `/app/static/`.
- `velocity_api/app.py` mounts `static/` as a `StaticFiles` route AFTER
  the API routers. A custom catch-all returns `index.html` for unknown
  paths (the SPA fallback nginx used to provide).
- FastAPI gets `GZipMiddleware` + a cache-control middleware that adds
  `Cache-Control: public, immutable, max-age=31536000` for `/assets/*`
  and `no-cache, no-store, must-revalidate` for `index.html` — same
  guarantees the previous `nginx.conf` made.
- `nginx.conf` is removed; the Playwright smoke specs that asserted
  `Cache-Control: immutable` and the `/healthz` endpoint continue to
  pass because both behaviors moved into FastAPI.
- `cloudbuild.yaml` continues to deploy a single service (the same
  `velocity2`) — the Dockerfile change is the only deploy delta.

**Why the reversal:**
- One URL, no CORS dance, no second trigger to maintain.
- Frontend's bundle size is small (~100 KB gzipped) so baking it into
  the API image adds negligible cold-start cost.
- Demo workload — independent scaling between FE and API isn't a real
  requirement yet.

**Trade-offs accepted:**
- The Python image is bigger than nginx-static (~80 MB vs ~25 MB
  compressed). Acceptable.
- Python serves static assets less efficiently than nginx. With
  GZipMiddleware + cache headers it's fine for the demo's traffic.
- If the API later needs different scaling than the frontend, we can
  split back into two services without rewriting either side — only the
  Dockerfile + cloudbuild.yaml move.

---

If a decision here turns out wrong, add a follow-up entry below
("Decision N: ..." with date) rather than editing the original. Keeps the
audit trail for future context.
