"""Debate orchestration tests.

We monkeypatch ``_get_anthropic_client`` (imported in both
``routes.chat`` and ``routes.debate``) so the orchestrator runs through
its real per-agent loop without touching the network.
"""

from __future__ import annotations

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
    output_tokens: int = 40
    cache_read_input_tokens: int = 80
    cache_creation_input_tokens: int = 0


@dataclass
class _FakeMessage:
    content: list[_FakeBlock]
    model: str = "claude-sonnet-4-6"
    stop_reason: str = "end_turn"
    usage: _FakeUsage = field(default_factory=_FakeUsage)


class _ScriptedMessages:
    """Cycles through a list of canned replies — one per call."""

    def __init__(self, replies: list[str], captured: list[dict[str, Any]]):
        self._replies = replies
        self._captured = captured
        self._idx = 0

    def create(self, **kwargs: Any) -> _FakeMessage:
        self._captured.append(kwargs)
        text = self._replies[self._idx % len(self._replies)]
        self._idx += 1
        return _FakeMessage(content=[_FakeBlock(type="text", text=text)])


class _FakeClient:
    def __init__(self, replies: list[str], captured: list[dict[str, Any]]):
        self.messages = _ScriptedMessages(replies, captured)


@pytest.fixture()
def captured(monkeypatch) -> list[dict[str, Any]]:
    cap: list[dict[str, Any]] = []
    replies = [
        "[赞成] 线上 DTC 是全屋净水套系最重要的增长抓手,建议加码内容投入。引用 ks-4。",
        "[保留] 短期 ROI 弱,先把投入控制在 18% 内。",
        "[反对] 渠道冲突未化解前不应放量。",
        "[赞成] 窗口期就在 Q2,再不动就丢机会。",
        "[保留] 县域售后履约能力仍是瓶颈。",
        "[保留] 排产柔性化是前置条件。",
        "[赞成] 组织能力可以与市场部共建。",
    ]
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: _FakeClient(replies, cap))
    return cap


# --- Tests ----------------------------------------------------------


def test_debate_list_seeded(client):
    res = client.get("/api/v1/strategy-questions/sq-1/debate")
    assert res.status_code == 200
    rows = res.json()
    # Seed contains 7 messages on sq-1.
    assert len(rows) == 7
    # Camel-case wire shape preserved.
    assert {row["round"] for row in rows} == {1, 2, 3}
    assert all("agentId" in row for row in rows)


def test_debate_run_round_persists_messages(client, captured):
    # Start from a question with a simpler agent set.
    res = client.post(
        "/api/v1/strategy-questions/sq-2/debate/round",
        json={},
    )
    assert res.status_code == 201, res.text
    body = res.json()
    # sq-2 has 5 agents; first round.
    assert body["round"] == 1
    assert len(body["messages"]) == 5
    stances = {m["stance"] for m in body["messages"]}
    assert stances <= {"pro", "con", "concern"}
    # Each call should have 3 cached system blocks (company + question + agent).
    for kwargs in captured:
        sys = kwargs["system"]
        assert all(blk.get("cache_control") == {"type": "ephemeral"} for blk in sys[:3])

    # Re-list — the new round shows up alongside any seeded ones.
    list_res = client.get("/api/v1/strategy-questions/sq-2/debate")
    assert list_res.status_code == 200
    assert any(r["round"] == 1 for r in list_res.json())


def test_debate_run_with_explicit_agents(client, captured):
    res = client.post(
        "/api/v1/strategy-questions/sq-1/debate/round",
        json={"agentIds": ["ag-product", "ag-finance"], "round": 4},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["round"] == 4
    assert {m["agentId"] for m in body["messages"]} == {"ag-product", "ag-finance"}


def test_debate_unknown_question_404(client):
    res = client.post(
        "/api/v1/strategy-questions/sq-missing/debate/round",
        json={},
    )
    assert res.status_code == 404


def test_debate_synthesis(client, captured):
    res = client.post("/api/v1/strategy-questions/sq-1/debate/synthesis")
    assert res.status_code == 200
    body = res.json()
    assert body["text"]  # any reply
    # Stance counts come from seed (3 pro, 1 con, 3 concern).
    assert body["pro"] == 3
    assert body["con"] == 1
    assert body["concern"] == 3


def test_debate_synthesis_empty_400(client, captured):
    # sq-5 has no debate messages.
    res = client.post("/api/v1/strategy-questions/sq-5/debate/synthesis")
    assert res.status_code == 400
    assert res.json()["detail"] == "no_debate_messages"


def test_debate_no_api_key_503(client, monkeypatch):
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: None)
    res = client.post("/api/v1/strategy-questions/sq-1/debate/round", json={})
    assert res.status_code == 503
    assert res.json()["detail"] == "anthropic_not_configured"
