"""Streaming chat + synthesis tests.

The Anthropic SDK exposes streaming via ``client.messages.stream(...)``,
which returns a context manager whose ``text_stream`` yields strings
and whose ``get_final_message()`` returns the assembled response.
We fake all three.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

import pytest

from velocity_api.routes import chat as chat_route


@dataclass
class _FakeUsage:
    input_tokens: int = 90
    output_tokens: int = 30
    cache_read_input_tokens: int = 70
    cache_creation_input_tokens: int = 0


@dataclass
class _FakeFinal:
    model: str = "claude-sonnet-4-6"
    stop_reason: str = "end_turn"
    usage: _FakeUsage = field(default_factory=_FakeUsage)


class _FakeStreamCtx:
    def __init__(self, chunks: list[str]):
        self._chunks = chunks
        self.text_stream = iter(chunks)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False

    def get_final_message(self) -> _FakeFinal:
        return _FakeFinal()


class _FakeMessages:
    def __init__(self, captured: list[dict[str, Any]], chunks: list[str]):
        self._captured = captured
        self._chunks = chunks

    def stream(self, **kwargs: Any) -> _FakeStreamCtx:
        self._captured.append(kwargs)
        return _FakeStreamCtx(list(self._chunks))


class _FakeClient:
    def __init__(self, captured: list[dict[str, Any]], chunks: list[str]):
        self.messages = _FakeMessages(captured, chunks)


@pytest.fixture()
def stream_captured(monkeypatch) -> list[dict[str, Any]]:
    cap: list[dict[str, Any]] = []
    chunks = ["你", "好,", "我", "是 ", "Velocity ", "助手。"]
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: _FakeClient(cap, chunks))
    return cap


def _parse_sse(body: bytes) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for chunk in body.split(b"\n\n"):
        chunk = chunk.strip()
        if not chunk:
            continue
        line = chunk.decode("utf-8")
        assert line.startswith("data: "), f"unexpected SSE line: {line!r}"
        events.append(json.loads(line[len("data: ") :]))
    return events


def test_chat_stream_yields_text_then_done(client, stream_captured):
    res = client.post(
        "/api/v1/chat/stream",
        json={"messages": [{"role": "user", "content": "你好"}]},
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/event-stream")
    events = _parse_sse(res.content)
    text_events = [e for e in events if e["type"] == "text"]
    done_events = [e for e in events if e["type"] == "done"]
    # Each chunk arrives as its own event.
    assert [e["text"] for e in text_events] == ["你", "好,", "我", "是 ", "Velocity ", "助手。"]
    assert len(done_events) == 1
    assert done_events[0]["model"] == "claude-sonnet-4-6"
    assert done_events[0]["usage"]["inputTokens"] == 90


def test_chat_stream_no_messages_400(client, stream_captured):
    res = client.post("/api/v1/chat/stream", json={"messages": []})
    assert res.status_code == 400


def test_chat_stream_no_key_503(client, monkeypatch):
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: None)
    res = client.post(
        "/api/v1/chat/stream",
        json={"messages": [{"role": "user", "content": "ping"}]},
    )
    assert res.status_code == 503


def test_synthesis_stream_emits_counts_then_text(client, stream_captured):
    res = client.post("/api/v1/strategy-questions/sq-1/debate/synthesis/stream")
    assert res.status_code == 200
    events = _parse_sse(res.content)
    # First event must be counts so the frontend can populate the pill.
    assert events[0]["type"] == "counts"
    # Seed has 3 pro / 1 con / 3 concern on sq-1.
    assert events[0]["pro"] == 3
    assert events[0]["con"] == 1
    assert events[0]["concern"] == 3
    # Then text events, then done.
    assert any(e["type"] == "text" for e in events)
    assert events[-1]["type"] == "done"


def test_synthesis_stream_no_messages_400(client, stream_captured):
    # sq-5 has no debate messages — the prompt builder rejects.
    res = client.post("/api/v1/strategy-questions/sq-5/debate/synthesis/stream")
    assert res.status_code == 400


def test_debate_round_stream_per_agent_events(client, stream_captured):
    # sq-2 has 5 agents in seed and no prior rounds.
    res = client.post(
        "/api/v1/strategy-questions/sq-2/debate/round/stream",
        json={},
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/event-stream")
    events = _parse_sse(res.content)

    # First event lays out the round + agents.
    assert events[0]["type"] == "round"
    assert events[0]["round"] == 1
    assert len(events[0]["agents"]) == 5
    # Each agent sends start → text* → done; final event is done.
    starts = [e for e in events if e["type"] == "agent_start"]
    dones = [e for e in events if e["type"] == "agent_done"]
    texts = [e for e in events if e["type"] == "text"]
    assert len(starts) == 5
    assert len(dones) == 5
    # Every text event carries the agentId so the frontend can route it.
    assert all("agentId" in t for t in texts)
    assert events[-1]["type"] == "done"
    assert events[-1]["round"] == 1

    # Persisted: a follow-up GET surfaces the new round.
    listed = client.get("/api/v1/strategy-questions/sq-2/debate").json()
    assert any(r["round"] == 1 for r in listed)


def test_debate_round_stream_no_key_503(client, monkeypatch):
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: None)
    res = client.post("/api/v1/strategy-questions/sq-1/debate/round/stream", json={})
    assert res.status_code == 503
