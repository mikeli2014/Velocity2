"""Multi-agent strategy debate orchestration.

Backs Strategy Studio's WarCouncil tab. Each strategy question carries a
list of participating ``Agent``s (CFO, Product, GTM, Ops, Risk, Supply,
Org, Tech). Running a "round" calls Claude once per agent — each call
gets:

- A **stable cached prefix**: Company facts (reused from chat helper) +
  the agent's persona (one of the 8 roles) + the question framing.
- A **volatile suffix**: the round's transcript so far (uncached).

Result: even with 7 agents per round, only 7× the volatile turn pays
input tokens; the persona + company prefix gets a cache hit on every
call past the first per-agent.

Stance is parsed out of a leading bracket marker we ask the model to
emit (``[赞成]`` / ``[反对]`` / ``[保留]``). The seed and the existing UI
both speak this vocabulary, so we don't introduce a JSON envelope.

Endpoints
---------

- ``GET  /api/v1/strategy-questions/{id}/debate`` — list debate rows.
- ``POST /api/v1/strategy-questions/{id}/debate/round`` — orchestrate one
  round, persist new ``DebateMessage`` rows, return the round payload.
- ``POST /api/v1/strategy-questions/{id}/debate/synthesis`` — single
  Sonnet call summarizing the full debate; returns text + stance counts.
"""

from __future__ import annotations

import logging
import re
from typing import Any

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from . import chat as chat_module
from .chat import DEFAULT_CHAT_MODEL, _company_block, _extract_text

logger = logging.getLogger("velocity_api.debate")

router = APIRouter(prefix="/api/v1/strategy-questions", tags=["debate"])

DEBATE_MAX_TOKENS = 800
SYNTHESIS_MAX_TOKENS = 700

_STANCE_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"^\s*\[\s*赞成\s*\]"), "pro"),
    (re.compile(r"^\s*\[\s*反对\s*\]"), "con"),
    (re.compile(r"^\s*\[\s*保留\s*\]"), "concern"),
]


# --- Helpers ---------------------------------------------------------


def _agent_block(agent: models.Agent) -> str:
    return (
        f"你扮演的是「{agent.name}」({agent.role or '—'})——一位企业战略研讨智能体。\n"
        f"关注重点:{agent.focus or '—'}。\n"
        "你的发言风格:专业、克制、不超过 4 句话;\n"
        "先给立场标记,然后说明理由,引用必要的数据 / 来源 ID;\n"
        "用「[赞成]」「[反对]」或「[保留]」开头标注立场;不要写多余前言。"
    )


def _question_block(question: models.StrategyQuestion, sources: list[models.KnowledgeSource]) -> str:
    parts = [
        f"研讨问题:{question.title}",
        f"提出者:{question.asker or '—'};当前轮次状态:{question.status or '—'}。",
    ]
    if question.summary:
        parts.append(f"问题概要:{question.summary}")
    if question.okrs:
        parts.append(f"关联 OKR:{'、'.join(question.okrs)}。")
    if sources:
        src_lines = [f"- [{s.id}] {s.title}" + (f" — {s.summary}" if s.summary else "") for s in sources]
        parts.append("可引用来源:\n" + "\n".join(src_lines))
    parts.append(
        "讨论规范:不要捏造数字,如缺数据请直说;立场可改变,但要给出促使你改变的证据。"
    )
    return "\n\n".join(parts)


def _parse_stance(text: str) -> tuple[str, str]:
    """Return (stance, body). Body has the leading marker stripped."""
    for pat, val in _STANCE_PATTERNS:
        m = pat.match(text)
        if m:
            return val, text[m.end() :].lstrip(" \n:：")
    return "concern", text.strip()


_ID_TOKEN_RE = re.compile(r"ks-[a-z0-9-]+", re.IGNORECASE)


def _scrape_source_ids(text: str, valid_ids: set[str]) -> list[str]:
    found: list[str] = []
    for tok in _ID_TOKEN_RE.findall(text):
        tok_l = tok.lower()
        if tok_l in valid_ids and tok_l not in found:
            found.append(tok_l)
    return found


def _to_out(row: models.DebateMessage) -> schemas.DebateMessageOut:
    return schemas.DebateMessageOut.model_validate(
        {
            "id": row.id,
            "question_id": row.question_id,
            "round": row.round,
            "agent_id": row.agent_id,
            "stance": row.stance,
            "text": row.text,
            "sources": row.sources or [],
            "model": row.model,
        }
    )


# --- Routes ----------------------------------------------------------


@router.get("/{question_id}/debate", response_model=list[schemas.DebateMessageOut])
def list_debate(question_id: str, db: Session = Depends(get_db)):
    if db.get(models.StrategyQuestion, question_id) is None:
        raise HTTPException(status_code=404, detail="question_not_found")
    rows = (
        db.query(models.DebateMessage)
        .filter(models.DebateMessage.question_id == question_id)
        .order_by(models.DebateMessage.round, models.DebateMessage.id)
        .all()
    )
    return [_to_out(r) for r in rows]


@router.post(
    "/{question_id}/debate/round",
    response_model=schemas.DebateRoundOut,
    status_code=status.HTTP_201_CREATED,
)
def run_debate_round(
    question_id: str,
    payload: schemas.DebateRoundIn,
    db: Session = Depends(get_db),
):
    question = db.get(models.StrategyQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="question_not_found")

    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    agent_ids = list(payload.agent_ids or question.agents or [])
    if not agent_ids:
        raise HTTPException(status_code=400, detail="no_agents")

    agents: list[models.Agent] = []
    for ag_id in agent_ids:
        ag = db.get(models.Agent, ag_id)
        if ag is None:
            raise HTTPException(status_code=400, detail=f"agent_not_found:{ag_id}")
        agents.append(ag)

    # Determine round number — next after the highest existing.
    if payload.round is not None:
        round_no = max(1, payload.round)
    else:
        last = (
            db.query(models.DebateMessage)
            .filter(models.DebateMessage.question_id == question_id)
            .order_by(models.DebateMessage.round.desc())
            .first()
        )
        round_no = (last.round + 1) if last else 1

    # Pull cited knowledge sources once — same set across all agents.
    sources: list[models.KnowledgeSource] = []
    for sid in question.context or []:
        s = db.get(models.KnowledgeSource, sid)
        if s is not None:
            sources.append(s)
    valid_source_ids = {s.id for s in sources}

    company = db.query(models.Company).first()
    company_text = _company_block(company)
    question_text = _question_block(question, sources)

    # Prior-rounds transcript (volatile — outside cache).
    prior_rows = (
        db.query(models.DebateMessage)
        .filter(models.DebateMessage.question_id == question_id)
        .filter(models.DebateMessage.round < round_no)
        .order_by(models.DebateMessage.round, models.DebateMessage.id)
        .all()
    )
    transcript_lines: list[str] = []
    for row in prior_rows:
        ag = db.get(models.Agent, row.agent_id)
        ag_label = ag.name if ag else row.agent_id
        transcript_lines.append(f"第 {row.round} 轮 · {ag_label}({row.stance}):{row.text}")
    transcript = "\n".join(transcript_lines) or "(本问题尚无历史发言)"

    new_rows: list[models.DebateMessage] = []
    used_model = DEFAULT_CHAT_MODEL

    for idx, agent in enumerate(agents):
        # Cached prefix: company → question → agent persona. Per-agent
        # persona stays at the END of the cached group so each agent's
        # call is its own cache key (different last-block bytes ⇒
        # distinct cache entries, but the company + question prefix is
        # shared across all 7 calls in a round).
        system_blocks: list[dict[str, Any]] = [
            {"type": "text", "text": company_text, "cache_control": {"type": "ephemeral"}},
            {"type": "text", "text": question_text, "cache_control": {"type": "ephemeral"}},
            {"type": "text", "text": _agent_block(agent), "cache_control": {"type": "ephemeral"}},
        ]
        # Volatile per-call instruction — outside cache.
        round_kind = "首轮陈述" if round_no == 1 else "交叉质询" if round_no == 2 else "立场收敛"
        user_msg = (
            f"现在是第 {round_no} 轮:{round_kind}。\n\n"
            f"已有发言:\n{transcript}\n\n"
            f"请以「{agent.name}」身份发表本轮意见。"
            "记得用 [赞成]/[反对]/[保留] 开头,4 句话以内。"
        )

        try:
            message = client.messages.create(
                model=DEFAULT_CHAT_MODEL,
                max_tokens=DEBATE_MAX_TOKENS,
                system=system_blocks,
                messages=[{"role": "user", "content": user_msg}],
            )
        except anthropic.RateLimitError as exc:
            logger.warning("debate rate-limited at agent idx %s: %s", idx, exc)
            raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
        except anthropic.BadRequestError as exc:
            logger.warning("debate bad request: %s", exc)
            raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
        except anthropic.APIError as exc:
            logger.exception("debate upstream error")
            raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

        text = _extract_text(message) or ""
        stance, body = _parse_stance(text)
        cited = _scrape_source_ids(body, valid_source_ids)
        used_model = getattr(message, "model", DEFAULT_CHAT_MODEL)

        row_id = schemas.make_id("dm")
        row = models.DebateMessage(
            id=row_id,
            question_id=question_id,
            round=round_no,
            agent_id=agent.id,
            stance=stance,
            text=body,
            sources=cited,
            model=used_model,
        )
        db.add(row)
        new_rows.append(row)

    # Bump the question's round counter for the registry display.
    question.rounds = max(question.rounds or 0, round_no)
    if question.status not in ("decided",):
        question.status = "in-debate"

    db.commit()
    for r in new_rows:
        db.refresh(r)

    return schemas.DebateRoundOut(round=round_no, messages=[_to_out(r) for r in new_rows])


def _build_synthesis_prompt(db: Session, question_id: str) -> tuple[list[dict[str, Any]], str, int, int, int]:
    """Shared prompt assembly for synchronous + streaming synthesis.

    Returns ``(system_blocks, user_msg, pro, con, concern)``. Raises
    ``HTTPException`` for the same failure modes both endpoints share.
    """
    question = db.get(models.StrategyQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="question_not_found")

    rows = (
        db.query(models.DebateMessage)
        .filter(models.DebateMessage.question_id == question_id)
        .order_by(models.DebateMessage.round, models.DebateMessage.id)
        .all()
    )
    if not rows:
        raise HTTPException(status_code=400, detail="no_debate_messages")

    pro = sum(1 for r in rows if r.stance == "pro")
    con = sum(1 for r in rows if r.stance == "con")
    concern = sum(1 for r in rows if r.stance == "concern")

    transcript_lines: list[str] = []
    for r in rows:
        ag = db.get(models.Agent, r.agent_id)
        ag_label = ag.name if ag else r.agent_id
        transcript_lines.append(f"第 {r.round} 轮 · {ag_label}({r.stance}):{r.text}")
    transcript = "\n".join(transcript_lines)

    company = db.query(models.Company).first()
    system_blocks = [
        {"type": "text", "text": _company_block(company), "cache_control": {"type": "ephemeral"}},
        {
            "type": "text",
            "text": (
                "你是 Velocity OS 的战略研讨摘要助手,擅长把多智能体辩论凝练成 3-4 句结论。\n"
                "结构:核心张力 + 各阵营观点 + 一条可执行的下一步。\n"
                "用简体中文,使用现有的「赞成 / 反对 / 保留」用词。"
            ),
            "cache_control": {"type": "ephemeral"},
        },
    ]
    user_msg = (
        f"问题:{question.title}\n\n研讨记录:\n{transcript}\n\n"
        f"统计:赞成 {pro} 人,反对 {con} 人,保留 {concern} 人。请生成研讨摘要。"
    )
    return system_blocks, user_msg, pro, con, concern


@router.post("/{question_id}/debate/synthesis", response_model=schemas.DebateSynthesisOut)
def debate_synthesis(question_id: str, db: Session = Depends(get_db)):
    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    system_blocks, user_msg, pro, con, concern = _build_synthesis_prompt(db, question_id)

    try:
        message = client.messages.create(
            model=DEFAULT_CHAT_MODEL,
            max_tokens=SYNTHESIS_MAX_TOKENS,
            system=system_blocks,
            messages=[{"role": "user", "content": user_msg}],
        )
    except anthropic.RateLimitError as exc:
        raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
    except anthropic.BadRequestError as exc:
        raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
    except anthropic.APIError as exc:
        logger.exception("synthesis upstream error")
        raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

    return schemas.DebateSynthesisOut(
        text=_extract_text(message),
        pro=pro,
        con=con,
        concern=concern,
        model=getattr(message, "model", DEFAULT_CHAT_MODEL),
    )


@router.post("/{question_id}/debate/synthesis/stream")
def debate_synthesis_stream(question_id: str, db: Session = Depends(get_db)):
    """SSE variant of debate synthesis. Same prompt, same prefix-cached
    system blocks; chunks the model output to the client as they arrive
    so the WarCouncil摘要面板 doesn't sit on a 5-10s "loading" state."""
    from fastapi.responses import StreamingResponse  # local import — only this route streams

    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    system_blocks, user_msg, pro, con, concern = _build_synthesis_prompt(db, question_id)

    def _wrapped() -> Any:
        # Re-use chat's _stream_completion for the SSE encoding + error
        # translation, then prepend a stance-counts event so the
        # frontend can populate the pill before the first text token.
        yield chat_module._sse(
            {"type": "counts", "pro": pro, "con": con, "concern": concern}
        )
        yield from chat_module._stream_completion(
            client,
            model=DEFAULT_CHAT_MODEL,
            max_tokens=SYNTHESIS_MAX_TOKENS,
            system=system_blocks,
            messages=[{"role": "user", "content": user_msg}],
        )

    return StreamingResponse(
        _wrapped(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )
