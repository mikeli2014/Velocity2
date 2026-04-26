# Velocity OS — unified container.
#
# Stage 1: build the React SPA. Stage 2: install the FastAPI backend AND
# copy the SPA's dist/ in alongside; the API serves both at runtime
# (see velocity_api/app.py spa_fallback). One Cloud Run service, one URL.

# --- Build stage (frontend) ---------------------------------------------
FROM node:20-alpine AS frontend
WORKDIR /web

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY index.html vite.config.js eslint.config.js ./
COPY src ./src
COPY tests ./tests
RUN npm run build


# --- Runtime (Python + bundled SPA) -------------------------------------
FROM python:3.11-slim AS runtime
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8080

# System deps for psycopg + general HTTPS hygiene. libpq is dynamic.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt && rm /tmp/requirements.txt

# Backend code
COPY apps/api/velocity_api ./velocity_api

# Frontend bundle (sibling to velocity_api/, see STATIC_DIR in app.py).
COPY --from=frontend /web/dist ./static

# Make the SQLite default writable. Cloud Run filesystem is ephemeral but
# writable under /app for the lifetime of the instance, which is fine for
# the demo's auto-seed model.
RUN mkdir -p .data

EXPOSE 8080
# Cloud Run sets PORT; honor it. Single worker keeps the SQLite default
# happy without WAL contention; bump workers when we move to Postgres.
CMD ["sh", "-c", "uvicorn velocity_api.app:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1"]
