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

import json
import logging
import re
from time import perf_counter
from typing import Any, Iterator

import anthropic
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..telemetry import record_llm_call
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


def _prepare_round(
    db: Session,
    question_id: str,
    payload: schemas.DebateRoundIn,
) -> tuple[
    models.StrategyQuestion,
    list[models.Agent],
    int,
    str,
    str,
    str,
    set[str],
]:
    """Shared prep for sync + streaming round endpoints. Returns
    (question, agents, round_no, company_text, question_text,
    transcript, valid_source_ids). Raises HTTPException on the same
    validation failures both code paths share."""
    question = db.get(models.StrategyQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="question_not_found")

    agent_ids = list(payload.agent_ids or question.agents or [])
    if not agent_ids:
        raise HTTPException(status_code=400, detail="no_agents")

    agents: list[models.Agent] = []
    for ag_id in agent_ids:
        ag = db.get(models.Agent, ag_id)
        if ag is None:
            raise HTTPException(status_code=400, detail=f"agent_not_found:{ag_id}")
        agents.append(ag)

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

    sources: list[models.KnowledgeSource] = []
    for sid in question.context or []:
        s = db.get(models.KnowledgeSource, sid)
        if s is not None:
            sources.append(s)
    valid_source_ids = {s.id for s in sources}

    company = db.query(models.Company).first()
    company_text = _company_block(company)
    question_text = _question_block(question, sources)

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

    return question, agents, round_no, company_text, question_text, transcript, valid_source_ids


def _round_kind(round_no: int) -> str:
    return "首轮陈述" if round_no == 1 else "交叉质询" if round_no == 2 else "立场收敛"


def _agent_call_args(
    *,
    agent: models.Agent,
    company_text: str,
    question_text: str,
    transcript: str,
    round_no: int,
) -> tuple[list[dict[str, Any]], str]:
    """Assemble the system blocks + user message for a single agent's
    contribution. Cached prefix: company → question → agent persona; the
    user turn (round + transcript) stays volatile."""
    system_blocks = [
        {"type": "text", "text": company_text, "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": question_text, "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": _agent_block(agent), "cache_control": {"type": "ephemeral"}},
    ]
    user_msg = (
        f"现在是第 {round_no} 轮:{_round_kind(round_no)}。\n\n"
        f"已有发言:\n{transcript}\n\n"
        f"请以「{agent.name}」身份发表本轮意见。"
        "记得用 [赞成]/[反对]/[保留] 开头,4 句话以内。"
    )
    return system_blocks, user_msg


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
    # Validate the question first so unknown ids 404 even when the
    # backend has no API key configured (otherwise 503 masks 404).
    question, agents, round_no, company_text, question_text, transcript, valid_source_ids = _prepare_round(
        db, question_id, payload
    )

    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    new_rows: list[models.DebateMessage] = []
    used_model = DEFAULT_CHAT_MODEL

    for idx, agent in enumerate(agents):
        system_blocks, user_msg = _agent_call_args(
            agent=agent,
            company_text=company_text,
            question_text=question_text,
            transcript=transcript,
            round_no=round_no,
        )
        agent_started = perf_counter()
        try:
            message = client.messages.create(
                model=DEFAULT_CHAT_MODEL,
                max_tokens=DEBATE_MAX_TOKENS,
                system=system_blocks,
                messages=[{"role": "user", "content": user_msg}],
            )
        except anthropic.RateLimitError as exc:
            logger.warning("debate rate-limited at agent idx %s: %s", idx, exc)
            record_llm_call(db, route="debate.round", model=DEFAULT_CHAT_MODEL,
                            latency_ms=int((perf_counter() - agent_started) * 1000),
                            status="error", error_detail="rate_limited")
            db.commit()
            raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
        except anthropic.BadRequestError as exc:
            logger.warning("debate bad request: %s", exc)
            record_llm_call(db, route="debate.round", model=DEFAULT_CHAT_MODEL,
                            latency_ms=int((perf_counter() - agent_started) * 1000),
                            status="error", error_detail="bad_request")
            db.commit()
            raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
        except anthropic.APIError as exc:
            logger.exception("debate upstream error")
            record_llm_call(db, route="debate.round", model=DEFAULT_CHAT_MODEL,
                            latency_ms=int((perf_counter() - agent_started) * 1000),
                            status="error", error_detail="upstream_error")
            db.commit()
            raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

        text = _extract_text(message) or ""
        stance, body = _parse_stance(text)
        cited = _scrape_source_ids(body, valid_source_ids)
        used_model = getattr(message, "model", DEFAULT_CHAT_MODEL)
        record_llm_call(
            db,
            route="debate.round",
            model=used_model,
            latency_ms=int((perf_counter() - agent_started) * 1000),
            usage=getattr(message, "usage", None),
        )

        row = models.DebateMessage(
            id=schemas.make_id("dm"),
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

    question.rounds = max(question.rounds or 0, round_no)
    if question.status not in ("decided",):
        question.status = "in-debate"

    db.commit()
    for r in new_rows:
        db.refresh(r)

    return schemas.DebateRoundOut(round=round_no, messages=[_to_out(r) for r in new_rows])


@router.post("/{question_id}/debate/round/stream")
def run_debate_round_stream(
    question_id: str,
    payload: schemas.DebateRoundIn,
    db: Session = Depends(get_db),
):
    """SSE variant of debate round.

    Per-agent wire format:

    - ``data: {"type":"round","round":N,"agents":[{id,name,role,color,icon}, ...]}``
      — emitted once at the start so the WarCouncil panel can lay out
      the agent slots before tokens arrive.
    - ``data: {"type":"agent_start","agentId":"ag-..."}``
    - ``data: {"type":"text","agentId":"ag-...","text":"chunk"}`` — N times
    - ``data: {"type":"agent_done","agentId":"ag-...","message":{...DebateMessageOut}}``
    - repeat for each agent
    - ``data: {"type":"done","round":N}`` at the very end.

    On Anthropic errors mid-stream, emit a single
    ``{"type":"error","detail":"..."}`` event — the HTTP status is 200
    by then so we can't go back.
    """
    # Validate the question first so unknown ids 404 (vs masking with 503).
    question, agents, round_no, company_text, question_text, transcript, valid_source_ids = _prepare_round(
        db, question_id, payload
    )

    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    # Snapshot for the generator. We reuse the request's ``db`` session —
    # FastAPI keeps generator-style Depends alive until the response body
    # finishes streaming, which is exactly the lifetime we want.
    question_id_snap = question_id
    round_no_snap = round_no
    valid_source_ids_snap = set(valid_source_ids)
    agent_payloads = [
        {
            "id": a.id,
            "name": a.name,
            "role": a.role,
            "color": a.color,
            "icon": a.icon,
            "_obj": a,
        }
        for a in agents
    ]

    def _gen() -> Iterator[bytes]:
        wire_agents = [{k: v for k, v in p.items() if k != "_obj"} for p in agent_payloads]
        yield chat_module._sse({"type": "round", "round": round_no_snap, "agents": wire_agents})

        for p in agent_payloads:
            agent = p["_obj"]
            yield chat_module._sse({"type": "agent_start", "agentId": agent.id})

            system_blocks, user_msg = _agent_call_args(
                agent=agent,
                company_text=company_text,
                question_text=question_text,
                transcript=transcript,
                round_no=round_no_snap,
            )
            buffered = ""
            final_model = DEFAULT_CHAT_MODEL
            final_usage: Any = None
            agent_started = perf_counter()
            err_detail: str | None = None
            try:
                with client.messages.stream(
                    model=DEFAULT_CHAT_MODEL,
                    max_tokens=DEBATE_MAX_TOKENS,
                    system=system_blocks,
                    messages=[{"role": "user", "content": user_msg}],
                ) as stream:
                    for token in stream.text_stream:
                        if token:
                            buffered += token
                            yield chat_module._sse({"type": "text", "agentId": agent.id, "text": token})
                    final = stream.get_final_message()
                    final_model = getattr(final, "model", DEFAULT_CHAT_MODEL)
                    final_usage = getattr(final, "usage", None)
            except anthropic.RateLimitError:
                err_detail = "rate_limited"
            except anthropic.BadRequestError:
                err_detail = "bad_request"
            except anthropic.APIError:
                logger.exception("debate stream upstream error")
                err_detail = "upstream_error"

            record_llm_call(
                db,
                route="debate.round.stream",
                model=final_model,
                latency_ms=int((perf_counter() - agent_started) * 1000),
                usage=final_usage,
                status="ok" if err_detail is None else "error",
                error_detail=err_detail,
            )

            if err_detail:
                yield chat_module._sse({"type": "error", "detail": f"anthropic_{err_detail}"})
                db.commit()
                return

            stance, body = _parse_stance(buffered)
            cited = _scrape_source_ids(body, valid_source_ids_snap)
            row = models.DebateMessage(
                id=schemas.make_id("dm"),
                question_id=question_id_snap,
                round=round_no_snap,
                agent_id=agent.id,
                stance=stance,
                text=body,
                sources=cited,
                model=final_model,
            )
            db.add(row)
            db.flush()
            yield chat_module._sse({
                "type": "agent_done",
                "agentId": agent.id,
                "message": json.loads(_to_out(row).model_dump_json(by_alias=True)),
            })

        q = db.get(models.StrategyQuestion, question_id_snap)
        if q is not None:
            q.rounds = max(q.rounds or 0, round_no_snap)
            if q.status not in ("decided",):
                q.status = "in-debate"
        db.commit()

        yield chat_module._sse({"type": "done", "round": round_no_snap})

    return StreamingResponse(
        _gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


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

    started = perf_counter()
    try:
        message = client.messages.create(
            model=DEFAULT_CHAT_MODEL,
            max_tokens=SYNTHESIS_MAX_TOKENS,
            system=system_blocks,
            messages=[{"role": "user", "content": user_msg}],
        )
    except anthropic.RateLimitError as exc:
        record_llm_call(db, route="debate.synthesis", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="rate_limited")
        db.commit()
        raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
    except anthropic.BadRequestError as exc:
        record_llm_call(db, route="debate.synthesis", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="bad_request")
        db.commit()
        raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
    except anthropic.APIError as exc:
        logger.exception("synthesis upstream error")
        record_llm_call(db, route="debate.synthesis", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="upstream_error")
        db.commit()
        raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

    record_llm_call(
        db,
        route="debate.synthesis",
        model=getattr(message, "model", DEFAULT_CHAT_MODEL),
        latency_ms=int((perf_counter() - started) * 1000),
        usage=getattr(message, "usage", None),
    )
    db.commit()
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
            db=db,
            route="debate.synthesis.stream",
        )

    return StreamingResponse(
        _wrapped(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


# --- Strategy options ---------------------------------------------------
#
# Output deliverables that consume the debate transcript and produce
# decision-ready artifacts:
#
#   1. ``/options/generate`` — 2-3 candidate options (saved to DB so the
#      page can re-render without paying tokens).
#   2. ``/structured-output/generate`` — single draft Objective + KRs +
#      projects + decision-log entry. Ephemeral (not persisted) — user
#      "promotes" via existing CRUD endpoints when they're ready.

OPTIONS_MAX_TOKENS = 1500
STRUCTURED_OUTPUT_MAX_TOKENS = 1800


def _option_to_out(row: models.StrategyOption) -> schemas.StrategyOptionOut:
    return schemas.StrategyOptionOut.model_validate(
        {
            "id": row.id,
            "question_id": row.question_id,
            "idx": row.idx,
            "name": row.name,
            "description": row.description,
            "roi": row.roi,
            "risk": row.risk,
            "time_estimate": row.time_estimate,
            "pros": row.pros,
            "cons": row.cons,
            "recommended": row.recommended,
            "model": row.model,
        }
    )


def _build_debate_summary_block(db: Session, question: models.StrategyQuestion) -> str:
    """Pull the persisted debate transcript and stance counts into a
    single text block for the options + structured-output prompts.
    Both endpoints share this so the cached prefix matches and the
    second call gets a cache hit on the first one's bytes."""
    rows = (
        db.query(models.DebateMessage)
        .filter(models.DebateMessage.question_id == question.id)
        .order_by(models.DebateMessage.round, models.DebateMessage.id)
        .all()
    )
    lines = [f"研讨问题:{question.title}"]
    if question.summary:
        lines.append(f"问题概要:{question.summary}")
    if question.okrs:
        lines.append(f"关联 OKR:{'、'.join(question.okrs)}。")
    if not rows:
        lines.append("(本问题尚无辩论记录,请基于问题概要做出判断。)")
        return "\n\n".join(lines)
    pro = sum(1 for r in rows if r.stance == "pro")
    con = sum(1 for r in rows if r.stance == "con")
    concern = sum(1 for r in rows if r.stance == "concern")
    lines.append(f"立场分布:赞成 {pro}、反对 {con}、保留 {concern}。")
    transcript_lines: list[str] = []
    for r in rows:
        ag = db.get(models.Agent, r.agent_id)
        ag_label = ag.name if ag else r.agent_id
        transcript_lines.append(f"第 {r.round} 轮 · {ag_label}({r.stance}):{r.text}")
    lines.append("研讨记录:\n" + "\n".join(transcript_lines))
    return "\n\n".join(lines)


_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.+?)\s*```", re.DOTALL)


def _parse_json_payload(text: str) -> Any:
    """Pull a JSON object out of an LLM response. Tolerates fenced code
    blocks (```json … ```) and plain top-level JSON. Returns None on
    failure — callers raise the right HTTPException."""
    if not text:
        return None
    m = _JSON_FENCE_RE.search(text)
    candidate = m.group(1) if m else text
    try:
        return json.loads(candidate)
    except (json.JSONDecodeError, ValueError):
        # One more attempt: trim to the first {...} block.
        start = candidate.find("{")
        end = candidate.rfind("}")
        if start >= 0 and end > start:
            try:
                return json.loads(candidate[start : end + 1])
            except (json.JSONDecodeError, ValueError):
                return None
    return None


@router.get("/{question_id}/options", response_model=list[schemas.StrategyOptionOut])
def list_options(question_id: str, db: Session = Depends(get_db)):
    if db.get(models.StrategyQuestion, question_id) is None:
        raise HTTPException(status_code=404, detail="question_not_found")
    rows = (
        db.query(models.StrategyOption)
        .filter(models.StrategyOption.question_id == question_id)
        .order_by(models.StrategyOption.idx, models.StrategyOption.id)
        .all()
    )
    return [_option_to_out(r) for r in rows]


@router.post(
    "/{question_id}/options/generate",
    response_model=list[schemas.StrategyOptionOut],
    status_code=status.HTTP_201_CREATED,
)
def generate_options(question_id: str, db: Session = Depends(get_db)):
    """Synthesize 2-3 candidate options from the debate transcript.
    Replaces any existing options for the question (regenerate-friendly)."""
    question = db.get(models.StrategyQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="question_not_found")

    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    company = db.query(models.Company).first()
    debate_block = _build_debate_summary_block(db, question)

    system_blocks = [
        {"type": "text", "text": chat_module._company_block(company), "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": debate_block, "cache_control": {"type": "ephemeral"}},
        {
            "type": "text",
            "text": (
                "你是 Velocity OS 的战略选项合成助手。基于上方公司背景与研讨记录,"
                "生成 2-3 个候选战略选项,体现激进 / 稳健 / 渐进 等不同节奏。\n\n"
                "**输出要求**:严格输出 JSON,不要包含其他解释文字。形如:\n"
                '{"options": ['
                '{"name":"选项 A · ...","description":"...","roi":"高|中|低",'
                '"risk":"高|中|低","time":"...","pros":3,"cons":2,"recommended":false}'
                "]}\n"
                "其中 pros/cons 是研讨中赞成 / 反对的论据数量(整数);"
                "recommended 仅一个为 true(被各方共识最大化的方案);"
                "name 用「选项 A · 简称」格式;description 控制在 1-2 句话。"
            ),
        },
    ]

    started = perf_counter()
    try:
        message = client.messages.create(
            model=DEFAULT_CHAT_MODEL,
            max_tokens=OPTIONS_MAX_TOKENS,
            system=system_blocks,
            messages=[{"role": "user", "content": "请基于以上研讨生成候选战略选项。"}],
        )
    except anthropic.RateLimitError as exc:
        record_llm_call(db, route="strategy.options", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="rate_limited")
        db.commit()
        raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
    except anthropic.BadRequestError as exc:
        record_llm_call(db, route="strategy.options", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="bad_request")
        db.commit()
        raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
    except anthropic.APIError as exc:
        logger.exception("options upstream error")
        record_llm_call(db, route="strategy.options", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="upstream_error")
        db.commit()
        raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

    record_llm_call(
        db,
        route="strategy.options",
        model=getattr(message, "model", DEFAULT_CHAT_MODEL),
        latency_ms=int((perf_counter() - started) * 1000),
        usage=getattr(message, "usage", None),
    )
    db.commit()  # persist telemetry even if subsequent parse fails
    raw = chat_module._extract_text(message)
    payload = _parse_json_payload(raw)
    if not payload or not isinstance(payload, dict) or not isinstance(payload.get("options"), list):
        raise HTTPException(status_code=502, detail="options_parse_failed")

    used_model = getattr(message, "model", DEFAULT_CHAT_MODEL)

    # Replace existing options for this question.
    db.query(models.StrategyOption).filter(
        models.StrategyOption.question_id == question_id
    ).delete()
    db.flush()

    new_rows: list[models.StrategyOption] = []
    for idx, opt in enumerate(payload["options"][:5]):  # cap to 5 just in case
        if not isinstance(opt, dict) or not opt.get("name"):
            continue
        row = models.StrategyOption(
            id=schemas.make_id("opt"),
            question_id=question_id,
            idx=idx,
            name=str(opt.get("name", "")).strip(),
            description=opt.get("description"),
            roi=opt.get("roi"),
            risk=opt.get("risk"),
            time_estimate=opt.get("time"),
            pros=int(opt.get("pros") or 0),
            cons=int(opt.get("cons") or 0),
            recommended=bool(opt.get("recommended")),
            model=used_model,
        )
        db.add(row)
        new_rows.append(row)

    if not new_rows:
        raise HTTPException(status_code=502, detail="options_parse_failed")

    # Bump question.options_count for the registry display.
    question.options_count = len(new_rows)
    db.commit()
    for r in new_rows:
        db.refresh(r)
    return [_option_to_out(r) for r in new_rows]


@router.post(
    "/{question_id}/structured-output/generate",
    response_model=schemas.StructuredOutputDraft,
)
def generate_structured_output(
    question_id: str,
    body: dict[str, Any] | None = None,
    db: Session = Depends(get_db),
):
    """Produce a single decision-ready draft (Objective + KRs +
    Projects + Decision-log entry). Ephemeral — frontend "applies" it
    via the existing CRUD endpoints when the user accepts.

    Body may include ``optionId`` to anchor the output on a specific
    candidate option; otherwise we use the recommended one."""
    question = db.get(models.StrategyQuestion, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="question_not_found")

    client = chat_module._get_anthropic_client()
    if client is None:
        raise HTTPException(status_code=503, detail="anthropic_not_configured")

    chosen_option_id = (body or {}).get("optionId")
    options = (
        db.query(models.StrategyOption)
        .filter(models.StrategyOption.question_id == question_id)
        .order_by(models.StrategyOption.idx, models.StrategyOption.id)
        .all()
    )
    chosen: models.StrategyOption | None = None
    if chosen_option_id:
        chosen = next((o for o in options if o.id == chosen_option_id), None)
    if chosen is None:
        chosen = next((o for o in options if o.recommended), None)
    if chosen is None and options:
        chosen = options[0]

    company = db.query(models.Company).first()
    debate_block = _build_debate_summary_block(db, question)
    if chosen is not None:
        chosen_block = (
            f"采纳的战略选项:{chosen.name}\n"
            f"描述:{chosen.description or '—'}\n"
            f"ROI:{chosen.roi or '—'} · 风险:{chosen.risk or '—'} · 节奏:{chosen.time_estimate or '—'}"
        )
    else:
        chosen_block = "(尚未选定具体选项,请基于研讨综合判断给出最稳健的方案。)"

    system_blocks = [
        {"type": "text", "text": chat_module._company_block(company), "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": debate_block, "cache_control": {"type": "ephemeral"}},
        {"type": "text", "text": chosen_block, "cache_control": {"type": "ephemeral"}},
        {
            "type": "text",
            "text": (
                "你是 Velocity OS 的结构化输出助手。基于公司背景、研讨记录与采纳的选项,"
                "生成一份决策落地草案,包含:\n"
                "  1. 一个 Objective 草案(带 code 如 O5、title、2-3 个 KR,每个 KR 含 kr 名称 + 量化 target)\n"
                "  2. 2-3 个关键项目(name + owner + 关键里程碑)\n"
                "  3. 一条决策日志(question + conclusion + 关键假设列表 + 反对意见列表 + evidence 简述)\n\n"
                "**输出要求**:严格输出 JSON,不要包含其他解释文字。形如:\n"
                '{"objective":{"code":"O5","title":"...","krs":[{"kr":"KR1 · ...","target":"≥ 22%"}]},'
                '"projects":[{"name":"...","owner":"...","milestone":"..."}],'
                '"decision":{"question":"...","conclusion":"...",'
                '"assumptions":["..."],"dissent":["..."],"evidence":"..."}}\n'
                "用简体中文,术语贴合公司既有用法(BP/SC/SA、CMF、奥维等)。"
            ),
        },
    ]

    started = perf_counter()
    try:
        message = client.messages.create(
            model=DEFAULT_CHAT_MODEL,
            max_tokens=STRUCTURED_OUTPUT_MAX_TOKENS,
            system=system_blocks,
            messages=[{"role": "user", "content": "请生成结构化输出草案。"}],
        )
    except anthropic.RateLimitError as exc:
        record_llm_call(db, route="strategy.structured_output", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="rate_limited")
        db.commit()
        raise HTTPException(status_code=429, detail="anthropic_rate_limited") from exc
    except anthropic.BadRequestError as exc:
        record_llm_call(db, route="strategy.structured_output", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="bad_request")
        db.commit()
        raise HTTPException(status_code=400, detail="anthropic_bad_request") from exc
    except anthropic.APIError as exc:
        logger.exception("structured-output upstream error")
        record_llm_call(db, route="strategy.structured_output", model=DEFAULT_CHAT_MODEL,
                        latency_ms=int((perf_counter() - started) * 1000),
                        status="error", error_detail="upstream_error")
        db.commit()
        raise HTTPException(status_code=502, detail="anthropic_upstream_error") from exc

    record_llm_call(
        db,
        route="strategy.structured_output",
        model=getattr(message, "model", DEFAULT_CHAT_MODEL),
        latency_ms=int((perf_counter() - started) * 1000),
        usage=getattr(message, "usage", None),
    )
    db.commit()
    raw = chat_module._extract_text(message)
    payload = _parse_json_payload(raw)
    if not isinstance(payload, dict) or "objective" not in payload or "decision" not in payload:
        raise HTTPException(status_code=502, detail="structured_output_parse_failed")

    obj = payload["objective"] or {}
    krs_raw = obj.get("krs") or []
    krs: list[dict[str, str]] = []
    for k in krs_raw:
        if isinstance(k, dict):
            krs.append({"kr": str(k.get("kr") or ""), "target": str(k.get("target") or "")})

    projects: list[schemas.StructuredOutputProjectDraft] = []
    for p in payload.get("projects") or []:
        if isinstance(p, dict) and p.get("name"):
            projects.append(schemas.StructuredOutputProjectDraft(
                name=str(p.get("name", "")),
                owner=p.get("owner"),
                milestone=p.get("milestone"),
            ))

    dec = payload.get("decision") or {}
    decision = schemas.StructuredOutputDecisionDraft(
        question=str(dec.get("question") or question.title),
        conclusion=str(dec.get("conclusion") or ""),
        assumptions=[str(a) for a in (dec.get("assumptions") or []) if a],
        dissent=[str(d) for d in (dec.get("dissent") or []) if d],
        evidence=dec.get("evidence"),
    )

    return schemas.StructuredOutputDraft(
        objective=schemas.StructuredOutputObjectiveDraft(
            code=str(obj.get("code") or "O?"),
            title=str(obj.get("title") or ""),
            krs=krs,
        ),
        projects=projects,
        decision=decision,
        recommended_option_id=chosen.id if chosen else None,
        model=getattr(message, "model", DEFAULT_CHAT_MODEL),
    )
