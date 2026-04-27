"""Haiku-backed routing classifier.

Given a free-form user prompt (e.g. an Assistant chat starter or a Cmd-K
query), pick the best matching ``RoutingRule`` from the registry and
return the rule + target dept + target skill.

Cost design
-----------

The routing rule catalog is rendered into a **single cached system
block** so that 1) the rule list is part of the cached prefix and
2) every routing call after the first hits cache. With ~10-20 rules the
catalog is well under 2K tokens — ideal for Haiku 4.5 + prompt
caching.

Output
------

We ask Haiku to emit a single line of the form::

    rule_id=<id>;confidence=<0.0..1.0>;rationale=<short text>

Cheap to parse, no JSON envelope required. If the model returns "none"
we fall back to no-match (rule_id=None).
"""

from __future__ import annotations

import logging
import re
from time import perf_counter
from typing import Any

import anthropic
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..telemetry import record_llm_call
from . import chat as chat_module
from .chat import HAIKU_MODEL, _company_block, _extract_text

logger = logging.getLogger("velocity_api.route")

router = APIRouter(prefix="/api/v1/route", tags=["route"])

ROUTE_MAX_TOKENS = 200


_LINE_RE = re.compile(
    r"rule_id\s*=\s*(?P<id>[a-zA-Z0-9_\-]+|none|null)"
    r"\s*;\s*confidence\s*=\s*(?P<conf>[0-9.]+)"
    r"\s*;\s*rationale\s*=\s*(?P<why>.+)",
    re.IGNORECASE | re.DOTALL,
)


def _rules_block(rules: list[models.RoutingRule]) -> str:
    if not rules:
        return "(暂无可用路由规则)"
    lines = ["可选路由规则(按优先级):"]
    for r in rules:
        if not r.enabled:
            continue
        bits = [f"id={r.id}", f"intent={r.intent or '—'}"]
        if r.target_dept:
            bits.append(f"dept={r.target_dept}")
        if r.target_skill:
            bits.append(f"skill={r.target_skill}")
        if r.priority:
            bits.append(f"priority={r.priority}")
        if r.note:
            bits.append(f"note={r.note}")
        lines.append("- " + "; ".join(bits))
    lines.append(
        '\n输出严格遵循:\n'
        '"rule_id=<匹配规则的 id 或 none>;confidence=<0~1 的小数>;rationale=<不超过 30 字的中文理由>"\n'
        "不要输出别的内容。"
    )
    return "\n".join(lines)


def _parse(line: str) -> tuple[str | None, float, str]:
    m = _LINE_RE.search(line.strip())
    if not m:
        return None, 0.0, line.strip()[:120]
    rid = m.group("id")
    if rid.lower() in ("none", "null"):
        rid = None
    try:
        conf = float(m.group("conf"))
    except ValueError:
        conf = 0.0
    return rid, max(0.0, min(1.0, conf)), m.group("why").strip()


@router.post("", response_model=schemas.RouteResultOut)
def classify_route(payload: schemas.RouteRequestIn, db: Session = Depends(get_db)):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="text_required")

    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    # Pull all enabled rules; let the model do the matching.
    rules = (
        db.query(models.RoutingRule)
        .order_by(models.RoutingRule.priority, models.RoutingRule.id)
        .all()
    )
    if payload.dept_id:
        rules = [r for r in rules if r.target_dept in (payload.dept_id, "platform", None)]

    company = db.query(models.Company).first()

    system_blocks: list[dict[str, Any]] = [
        {"type": "text", "text": _company_block(company), "cache_control": {"type": "ephemeral"}},
        {
            "type": "text",
            "text": (
                "你是 Velocity OS 的请求分诊器。对照下方路由规则,选出最匹配的一条,"
                "或者输出 none 表示无规则匹配。优先匹配 intent 字段语义。\n\n"
                + _rules_block(rules)
            ),
            "cache_control": {"type": "ephemeral"},
        },
    ]

    started = perf_counter()
    try:
        message = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=ROUTE_MAX_TOKENS,
            system=system_blocks,
            messages=[{"role": "user", "content": payload.text.strip()}],
        )
    except anthropic.RateLimitError as exc:
        record_llm_call(db, route="route", model=HAIKU_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="rate_limited")
        db.commit()
        raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
    except anthropic.BadRequestError as exc:
        record_llm_call(db, route="route", model=HAIKU_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="bad_request")
        db.commit()
        raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
    except anthropic.APIError as exc:
        logger.exception("route upstream error")
        record_llm_call(db, route="route", model=HAIKU_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="upstream_error")
        db.commit()
        raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

    record_llm_call(
        db,
        route="route",
        model=getattr(message, "model", HAIKU_MODEL),
        latency_ms=int((perf_counter() - started) * 1000),
        usage=getattr(message, "usage", None),
    )
    db.commit()
    raw = _extract_text(message)
    rule_id, conf, rationale = _parse(raw)

    rule = db.get(models.RoutingRule, rule_id) if rule_id else None
    return schemas.RouteResultOut(
        intent=rule.intent if rule else None,
        rule_id=rule.id if rule else None,
        dept_id=rule.target_dept if rule else None,
        skill_id=rule.target_skill if rule else None,
        confidence=conf,
        rationale=rationale,
        model=getattr(message, "model", HAIKU_MODEL),
    )
