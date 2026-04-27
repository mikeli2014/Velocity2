"""Admin-facing AI usage telemetry.

Backs the "AI 用量 · 缓存命中" panel. Aggregates the ``llm_calls``
table by model and by route, plus returns the most recent calls so
the panel can show what's been running.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/llm-usage", tags=["telemetry"])


def _bucketize(rows: list[models.LLMCall], key_fn) -> list[schemas.LLMUsageBucket]:
    buckets: dict[str, dict[str, Any]] = defaultdict(lambda: {
        "calls": 0,
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read_input_tokens": 0,
        "cache_creation_input_tokens": 0,
    })
    for r in rows:
        b = buckets[key_fn(r)]
        b["calls"] += 1
        b["input_tokens"] += r.input_tokens or 0
        b["output_tokens"] += r.output_tokens or 0
        b["cache_read_input_tokens"] += r.cache_read_input_tokens or 0
        b["cache_creation_input_tokens"] += r.cache_creation_input_tokens or 0
    return [
        schemas.LLMUsageBucket(key=k, **v)
        for k, v in sorted(buckets.items(), key=lambda kv: -kv[1]["calls"])
    ]


@router.get("/summary", response_model=schemas.LLMUsageSummaryOut)
def usage_summary(
    limit: int = Query(default=20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    rows = db.query(models.LLMCall).all()
    total_in = sum(r.input_tokens or 0 for r in rows)
    total_out = sum(r.output_tokens or 0 for r in rows)
    total_cr = sum(r.cache_read_input_tokens or 0 for r in rows)
    total_cc = sum(r.cache_creation_input_tokens or 0 for r in rows)

    # Cache hit ratio: bytes served from cache / total prompt bytes
    # (cached + creation + uncached). Uncached portion = total_in
    # because the SDK's ``input_tokens`` counts non-cached prompt
    # tokens; cache_read + cache_creation are reported separately.
    denom = total_cr + total_cc + total_in
    ratio = (total_cr / denom) if denom > 0 else 0.0

    recent_rows = (
        db.query(models.LLMCall)
        .order_by(models.LLMCall.created_at.desc())
        .limit(limit)
        .all()
    )
    recent = [
        schemas.LLMCallOut.model_validate({
            "id": r.id,
            "route": r.route,
            "model": r.model,
            "input_tokens": r.input_tokens,
            "output_tokens": r.output_tokens,
            "cache_read_input_tokens": r.cache_read_input_tokens,
            "cache_creation_input_tokens": r.cache_creation_input_tokens,
            "latency_ms": r.latency_ms,
            "status": r.status,
            "error_detail": r.error_detail,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
        for r in recent_rows
    ]

    return schemas.LLMUsageSummaryOut(
        total_calls=len(rows),
        total_input_tokens=total_in,
        total_output_tokens=total_out,
        total_cache_read_input_tokens=total_cr,
        total_cache_creation_input_tokens=total_cc,
        cache_hit_ratio=round(ratio, 4),
        by_model=_bucketize(rows, lambda r: r.model or "unknown"),
        by_route=_bucketize(rows, lambda r: r.route or "unknown"),
        recent=recent,
    )
