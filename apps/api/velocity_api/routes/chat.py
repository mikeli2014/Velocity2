"""Anthropic-backed chat endpoint.

Backs two frontend surfaces:

1. ``DepartmentPage.AssistantChat`` — multi-turn conversation scoped to a
   department persona (e.g. CMF 中台 → 小龙虾 助手).
2. ``RunDialog`` (Skills + Workflows) — single-turn structured-output
   generation framed by the chosen skill pack.

Design notes
------------

* **Prompt caching invariant** — render order is ``tools → system →
  messages``. We assemble the system as a list of ``TextBlockParam``
  blocks with ``cache_control: {"type": "ephemeral"}`` on the LAST block
  of each cacheable group. The Company facts (largest, most stable)
  come first; the optional department / skill block second; the
  per-request volatile suffix LAST and **uncached**. Any byte change in
  the cached prefix invalidates everything after it — the volatile
  ``ChatRequestIn.system_suffix`` therefore lives outside the cached
  blocks.

* **Default model** — ``claude-sonnet-4-6``. The user explicitly chose
  this for the demo (cost / latency tradeoff vs Opus). Haiku 4.5 is
  reserved for a future routing classifier and is exposed as
  ``HAIKU_MODEL`` so other call sites can import it.

* **Max tokens** — chat-sized default (1024). The request can override
  via ``ChatRequestIn.max_tokens`` for longer skill outputs.

* **Errors** — typed Anthropic exceptions are translated to stable
  ``HTTPException`` slugs the frontend can localize:
  ``anthropic_not_configured`` (503), ``anthropic_rate_limited`` (429),
  ``anthropic_bad_request`` (400), ``anthropic_upstream_error`` (502).

* **Testing** — ``_get_anthropic_client`` is the single seam tests
  monkeypatch. It returns ``None`` if no API key is configured so the
  endpoint can fail fast with a 503 rather than blow up at SDK init.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Iterable, Iterator

import anthropic
from anthropic import Anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..settings import settings

logger = logging.getLogger("velocity_api.chat")

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

# --- Model defaults ---------------------------------------------------

DEFAULT_CHAT_MODEL = "claude-sonnet-4-6"
HAIKU_MODEL = "claude-haiku-4-5"  # reserved for future routing classifier
DEFAULT_MAX_TOKENS = 1024


# --- Anthropic client (single seam for tests) ------------------------


def _get_anthropic_client() -> Anthropic | None:
    """Return a configured Anthropic client, or ``None`` if no key.

    Tests monkeypatch this function directly so we never hit the network.
    The SDK auto-detects ``ANTHROPIC_API_KEY``; we also support the
    ``VELOCITY_API_ANTHROPIC_API_KEY`` form via ``settings``.
    """
    api_key = settings.anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return None
    return Anthropic(api_key=api_key)


# --- System prompt assembly ------------------------------------------


def _company_block(company: models.Company | None) -> str:
    """Stable, byte-identical-across-requests system prefix derived from
    the Company row. Kept long-form so it actually exceeds the ~1024
    token minimum prompt-caching threshold once the company adds focus
    areas / competitors / terminology.
    """
    if company is None:
        return (
            "你是 Velocity OS 内置的企业智能助手,服务于一家中国智能家电与厨卫电器公司。\n"
            "请用简体中文回答,语气专业、克制,引用公司知识库时给出可追溯的来源。"
        )

    lines: list[str] = [
        f"你是 Velocity OS 内置的企业智能助手,服务于「{company.name}」({company.name_en})。",
        f"行业:{company.industry or '—'}。{company.tagline or ''}".rstrip("。 ") + "。",
    ]
    if company.fiscal_year or company.revenue or company.employees:
        lines.append(
            "公司概况:"
            f"财年 {company.fiscal_year or '—'}、"
            f"营收 {company.revenue or '—'}、"
            f"员工 {company.employees or '—'}。"
        )

    focus = list(company.focus_areas or [])
    if focus:
        lines.append("战略重点:" + "、".join(focus[:8]) + "。")

    competitors = list(company.competitors or [])
    if competitors:
        comp_names: list[str] = []
        for c in competitors[:8]:
            if isinstance(c, dict):
                name = c.get("name") or c.get("title")
                if name:
                    comp_names.append(str(name))
        if comp_names:
            lines.append("主要竞品:" + "、".join(comp_names) + "。")

    terms = list(company.terminology or [])
    term_lines: list[str] = []
    for t in terms[:12]:
        if isinstance(t, dict):
            term = t.get("term") or t.get("name")
            meaning = t.get("meaning") or t.get("desc")
            if term and meaning:
                term_lines.append(f"- {term}:{meaning}")
    if term_lines:
        lines.append("术语速查:\n" + "\n".join(term_lines))

    if company.context_prompt:
        lines.append(company.context_prompt.strip())

    lines.append(
        "回答规范:\n"
        "- 默认使用简体中文。\n"
        "- 引用公司数据 / 知识时,标注来源(部门、文档、OKR 编号等)。\n"
        "- 不知道就说不知道,不要捏造数字。\n"
        "- 优先给出可执行结论 + 关键假设 + 下一步建议。"
    )
    return "\n\n".join(lines)


def _dept_block(dept: models.Department | None) -> str | None:
    if dept is None:
        return None
    parts = [
        f"当前部门:{dept.name}" + (f"({dept.en})" if dept.en else "") + "。",
        f"部门负责人:{dept.lead or '—'}、人员规模:{dept.people or 0} 人。",
    ]
    if dept.assistant and dept.assistant != "—":
        parts.append(f"你以「{dept.assistant}」的身份与该部门成员对话,语气贴合该部门的工作场景。")
    return " ".join(parts)


def _skill_block(skill: models.SkillPack | None) -> str | None:
    if skill is None:
        return None
    parts = [
        f"当前技能:{skill.name}(版本 {skill.version or '—'})。",
    ]
    if skill.input:
        parts.append(f"期望输入:{skill.input}。")
    if skill.output:
        parts.append(f"期望输出:{skill.output}。")
    parts.append("请按该技能的标准产出格式回答,先给结论再给依据,引用必要的知识来源。")
    return " ".join(parts)


def _build_system_blocks(
    db: Session,
    *,
    dept_id: str | None,
    skill_id: str | None,
    suffix: str | None,
) -> list[dict[str, Any]]:
    """Return the ``system=`` payload as a list of TextBlockParam dicts.

    The last block of each cacheable group carries ``cache_control``.
    Volatile suffix is appended as a final, uncached block.
    """
    company = db.query(models.Company).first()
    blocks: list[dict[str, Any]] = [
        {
            "type": "text",
            "text": _company_block(company),
            "cache_control": {"type": "ephemeral"},
        }
    ]

    scope_text_parts: list[str] = []
    if dept_id:
        dept = db.get(models.Department, dept_id)
        dept_text = _dept_block(dept)
        if dept_text:
            scope_text_parts.append(dept_text)
    if skill_id:
        skill = db.get(models.SkillPack, skill_id)
        skill_text = _skill_block(skill)
        if skill_text:
            scope_text_parts.append(skill_text)

    if scope_text_parts:
        blocks.append(
            {
                "type": "text",
                "text": "\n\n".join(scope_text_parts),
                "cache_control": {"type": "ephemeral"},
            }
        )

    if suffix and suffix.strip():
        # Volatile per-request guidance — intentionally NOT cached.
        blocks.append({"type": "text", "text": suffix.strip()})

    return blocks


# --- Endpoint --------------------------------------------------------


def _extract_text(message: Any) -> str:
    """Pull plain text out of an Anthropic ``Message`` response."""
    pieces: list[str] = []
    for block in getattr(message, "content", []) or []:
        # SDK objects expose .type / .text; mocks may pass plain dicts.
        btype = getattr(block, "type", None) or (block.get("type") if isinstance(block, dict) else None)
        if btype == "text":
            text = getattr(block, "text", None) or (block.get("text") if isinstance(block, dict) else None)
            if text:
                pieces.append(str(text))
    return "\n".join(pieces).strip()


def _usage_to_schema(usage: Any) -> schemas.ChatUsageOut:
    def _g(name: str) -> int:
        val = getattr(usage, name, None)
        if val is None and isinstance(usage, dict):
            val = usage.get(name)
        return int(val or 0)

    return schemas.ChatUsageOut(
        input_tokens=_g("input_tokens"),
        output_tokens=_g("output_tokens"),
        cache_read_input_tokens=_g("cache_read_input_tokens"),
        cache_creation_input_tokens=_g("cache_creation_input_tokens"),
    )


@router.post("", response_model=schemas.ChatResponseOut)
def chat(payload: schemas.ChatRequestIn, db: Session = Depends(get_db)) -> schemas.ChatResponseOut:
    if not payload.messages:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="messages_required")

    client = _get_anthropic_client()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="anthropic_not_configured",
        )

    system_blocks = _build_system_blocks(
        db,
        dept_id=payload.dept_id,
        skill_id=payload.skill_id,
        suffix=payload.system_suffix,
    )
    api_messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    model = payload.model or DEFAULT_CHAT_MODEL
    max_tokens = payload.max_tokens or DEFAULT_MAX_TOKENS

    try:
        message = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system_blocks,
            messages=api_messages,
        )
    except anthropic.RateLimitError as exc:
        logger.warning("anthropic rate limited: %s", exc)
        raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
    except anthropic.BadRequestError as exc:
        logger.warning("anthropic bad request: %s", exc)
        raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
    except anthropic.APIError as exc:
        logger.exception("anthropic upstream error")
        raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

    return schemas.ChatResponseOut(
        text=_extract_text(message),
        model=getattr(message, "model", model),
        stop_reason=getattr(message, "stop_reason", None),
        usage=_usage_to_schema(getattr(message, "usage", None) or {}),
    )


# --- Streaming -------------------------------------------------------
#
# SSE wire format
# ---------------
#
# All streaming endpoints emit ``text/event-stream`` with three event
# types, one JSON payload per event:
#
#   data: {"type":"text","text":"..."}\n\n
#   data: {"type":"done","model":"...","usage":{...}}\n\n
#   data: {"type":"error","detail":"..."}\n\n
#
# We don't use named events (``event: ...``) because the data field
# already carries ``type`` and EventSource-style consumers care little
# about the wrapper. The frontend's ``apiStream`` helper parses the
# JSON and dispatches by ``type``.


def _sse(payload: dict[str, Any]) -> bytes:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode("utf-8")


def _stream_completion(
    client: Anthropic,
    *,
    model: str,
    max_tokens: int,
    system: list[dict[str, Any]],
    messages: Iterable[dict[str, Any]],
) -> Iterator[bytes]:
    """Drive an Anthropic streaming call and yield SSE-encoded events.

    Catches typed Anthropic exceptions and translates them to a final
    ``error`` event (callers should NOT raise after the response has
    started streaming — the HTTP status is already 200).
    """
    try:
        with client.messages.stream(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=list(messages),
        ) as stream:
            for token in stream.text_stream:
                if token:
                    yield _sse({"type": "text", "text": token})
            final = stream.get_final_message()
            yield _sse(
                {
                    "type": "done",
                    "model": getattr(final, "model", model),
                    "stopReason": getattr(final, "stop_reason", None),
                    "usage": _usage_to_schema(getattr(final, "usage", None) or {}).model_dump(by_alias=True),
                }
            )
    except anthropic.RateLimitError:
        yield _sse({"type": "error", "detail": "anthropic_rate_limited"})
    except anthropic.BadRequestError:
        yield _sse({"type": "error", "detail": "anthropic_bad_request"})
    except anthropic.APIError:
        logger.exception("anthropic stream upstream error")
        yield _sse({"type": "error", "detail": "anthropic_upstream_error"})


@router.post("/stream")
def chat_stream(payload: schemas.ChatRequestIn, db: Session = Depends(get_db)):
    if not payload.messages:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="messages_required")

    client = _get_anthropic_client()
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="anthropic_not_configured",
        )

    system_blocks = _build_system_blocks(
        db,
        dept_id=payload.dept_id,
        skill_id=payload.skill_id,
        suffix=payload.system_suffix,
    )
    api_messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    model = payload.model or DEFAULT_CHAT_MODEL
    max_tokens = payload.max_tokens or DEFAULT_MAX_TOKENS

    return StreamingResponse(
        _stream_completion(
            client,
            model=model,
            max_tokens=max_tokens,
            system=system_blocks,
            messages=api_messages,
        ),
        media_type="text/event-stream",
        headers={
            # Prevent Cloud Run / proxies from buffering the stream.
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )
