"""LLM usage telemetry tests.

Verifies that the per-route call sites write LLMCall rows and the
summary endpoint aggregates them correctly. The Anthropic client is
faked the same way as in test_chat.py.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

import pytest

from velocity_api.routes import chat as chat_route


@dataclass
class _FakeBlock:
    type: str
    text: str


@dataclass
class _FakeUsage:
    input_tokens: int = 100
    output_tokens: int = 50
    cache_read_input_tokens: int = 80
    cache_creation_input_tokens: int = 20


@dataclass
class _FakeMessage:
    content: list[_FakeBlock]
    model: str = "claude-sonnet-4-6"
    stop_reason: str = "end_turn"
    usage: _FakeUsage = field(default_factory=_FakeUsage)


class _FakeMessages:
    def __init__(self, reply: str, model: str = "claude-sonnet-4-6"):
        self._reply = reply
        self._model = model

    def create(self, **kwargs: Any) -> _FakeMessage:
        return _FakeMessage(content=[_FakeBlock(type="text", text=self._reply)],
                            model=self._model)


class _FakeClient:
    def __init__(self, reply: str, model: str = "claude-sonnet-4-6"):
        self.messages = _FakeMessages(reply, model)


def _patch(monkeypatch, reply: str, model: str = "claude-sonnet-4-6"):
    monkeypatch.setattr(chat_route, "_get_anthropic_client",
                        lambda: _FakeClient(reply, model))


# --- Empty state ------------------------------------------------------


def test_summary_empty(client):
    res = client.get("/api/v1/llm-usage/summary")
    assert res.status_code == 200
    body = res.json()
    assert body["totalCalls"] == 0
    assert body["totalInputTokens"] == 0
    assert body["cacheHitRatio"] == 0.0
    assert body["byModel"] == []
    assert body["byRoute"] == []
    assert body["recent"] == []


# --- Chat route writes a row ------------------------------------------


def test_chat_call_writes_telemetry(client, monkeypatch):
    _patch(monkeypatch, "你好。")
    res = client.post(
        "/api/v1/chat",
        json={"messages": [{"role": "user", "content": "ping"}]},
    )
    assert res.status_code == 200

    summary = client.get("/api/v1/llm-usage/summary").json()
    assert summary["totalCalls"] == 1
    assert summary["totalInputTokens"] == 100
    assert summary["totalOutputTokens"] == 50
    assert summary["totalCacheReadInputTokens"] == 80
    assert summary["totalCacheCreationInputTokens"] == 20
    # cache_read / (read + creation + uncached_input) = 80 / 200 = 0.40
    assert abs(summary["cacheHitRatio"] - 0.4) < 1e-6
    # Per-model + per-route buckets present.
    assert summary["byModel"][0]["key"] == "claude-sonnet-4-6"
    assert summary["byRoute"][0]["key"] == "chat"
    # Recent[0] is this call.
    assert summary["recent"][0]["route"] == "chat"
    assert summary["recent"][0]["status"] == "ok"


# --- Multiple calls aggregate -----------------------------------------


def test_summary_aggregates_multiple_routes(client, monkeypatch):
    # 1 chat call (Sonnet)
    _patch(monkeypatch, "ok")
    client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": "1"}]})

    # 2 route calls (Haiku) — different model + different route slug.
    _patch(monkeypatch, "rule_id=none;confidence=0.1;rationale=test", model="claude-haiku-4-5")
    client.post("/api/v1/route", json={"text": "test 1"})
    client.post("/api/v1/route", json={"text": "test 2"})

    summary = client.get("/api/v1/llm-usage/summary").json()
    assert summary["totalCalls"] == 3
    by_route = {b["key"]: b for b in summary["byRoute"]}
    assert by_route["chat"]["calls"] == 1
    assert by_route["route"]["calls"] == 2
    by_model = {b["key"]: b for b in summary["byModel"]}
    assert by_model["claude-sonnet-4-6"]["calls"] == 1
    assert by_model["claude-haiku-4-5"]["calls"] == 2


# --- Error path still records -----------------------------------------


def test_chat_error_records_telemetry_with_error_status(client, monkeypatch):
    """Force the chat handler down its RateLimitError branch and verify
    we still write a telemetry row with status=error. We bypass the
    SDK's exception constructor (which insists on a real httpx response)
    by subclassing — only the type matters for the except filter."""
    import anthropic

    class _FakeRateLimit(anthropic.RateLimitError):
        def __init__(self):
            Exception.__init__(self, "rate limit (test fake)")

    class _ErrMessages:
        def create(self, **kwargs):
            raise _FakeRateLimit()

    class _ErrClient:
        messages = _ErrMessages()

    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: _ErrClient())
    res = client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": "x"}]})
    assert res.status_code == 429

    summary = client.get("/api/v1/llm-usage/summary").json()
    assert summary["totalCalls"] == 1
    row = summary["recent"][0]
    assert row["status"] == "error"
    assert row["errorDetail"] == "rate_limited"
    # No usage on error path.
    assert row["inputTokens"] == 0


# --- Limit param caps recent ------------------------------------------


def test_summary_limit_caps_recent(client, monkeypatch):
    _patch(monkeypatch, "ok")
    for i in range(5):
        client.post("/api/v1/chat", json={"messages": [{"role": "user", "content": str(i)}]})

    summary = client.get("/api/v1/llm-usage/summary?limit=3").json()
    assert summary["totalCalls"] == 5  # totals span all rows
    assert len(summary["recent"]) == 3   # but recent is capped
