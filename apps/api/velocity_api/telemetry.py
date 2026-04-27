"""LLM call telemetry — every Sonnet / Haiku call records one
``LLMCall`` row so the Admin "AI 用量 · 缓存命中" panel can show
tokens by model + route, cache hit ratio, and recent calls.

Usage:
    from .telemetry import record_llm_call

    started = perf_counter()
    try:
        message = client.messages.create(...)
    except Exception:
        record_llm_call(db, route="chat", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter()-started)*1000),
                        status="error", error_detail=...)
        raise
    record_llm_call(db, route="chat", model=DEFAULT_CHAT_MODEL,
                    latency_ms=int((perf_counter()-started)*1000),
                    usage=getattr(message, "usage", None))

The helper is best-effort: an exception while writing telemetry must
NOT break the actual request (we wrap in try/except and log).
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.orm import Session

from . import models, schemas

logger = logging.getLogger("velocity_api.telemetry")


def _coerce_int(value: Any) -> int:
    """Best-effort int conversion for SDK objects (which may expose
    ``input_tokens`` as int) or plain dicts (raw API response)."""
    if value is None:
        return 0
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def record_llm_call(
    db: Session,
    *,
    route: str,
    model: str,
    latency_ms: int,
    usage: Any = None,
    status: str = "ok",
    error_detail: str | None = None,
) -> None:
    """Append a single ``LLMCall`` row. Caller is responsible for
    committing — we share the request session so the telemetry write
    is atomic with whatever triggered it.

    ``usage`` is the SDK's usage object or a dict; we read by attr-or-key.
    """
    try:
        def g(name: str) -> int:
            if usage is None:
                return 0
            v = getattr(usage, name, None)
            if v is None and isinstance(usage, dict):
                v = usage.get(name)
            return _coerce_int(v)

        row = models.LLMCall(
            id=schemas.make_id("llm"),
            route=route,
            model=model,
            input_tokens=g("input_tokens"),
            output_tokens=g("output_tokens"),
            cache_read_input_tokens=g("cache_read_input_tokens"),
            cache_creation_input_tokens=g("cache_creation_input_tokens"),
            latency_ms=max(0, int(latency_ms)),
            status=status,
            error_detail=(error_detail[:500] if error_detail else None),
        )
        db.add(row)
    except Exception:  # noqa: BLE001 — telemetry must not break the request
        logger.exception("llm telemetry write failed; ignoring")
