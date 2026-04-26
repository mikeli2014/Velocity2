"""Routing classifier tests."""

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
    input_tokens: int = 60
    output_tokens: int = 25
    cache_read_input_tokens: int = 50
    cache_creation_input_tokens: int = 0


@dataclass
class _FakeMessage:
    content: list[_FakeBlock]
    model: str = "claude-haiku-4-5"
    stop_reason: str = "end_turn"
    usage: _FakeUsage = field(default_factory=_FakeUsage)


class _Messages:
    def __init__(self, captured: dict[str, Any], reply: str):
        self._captured = captured
        self._reply = reply

    def create(self, **kwargs: Any):
        self._captured.update(kwargs)
        return _FakeMessage(content=[_FakeBlock(type="text", text=self._reply)])


class _Client:
    def __init__(self, captured: dict[str, Any], reply: str):
        self.messages = _Messages(captured, reply)


def _patch(monkeypatch, reply: str) -> dict[str, Any]:
    cap: dict[str, Any] = {}
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: _Client(cap, reply))
    return cap


def test_route_match_existing_rule(client, monkeypatch):
    # Pick a real seeded routing rule id by listing them first.
    rules_res = client.get("/api/v1/routing-rules")
    assert rules_res.status_code == 200
    rules = rules_res.json()
    assert rules
    rid = rules[0]["id"]

    cap = _patch(monkeypatch, f"rule_id={rid};confidence=0.92;rationale=匹配 CMF 工艺关键词")
    res = client.post("/api/v1/route", json={"text": "PVD 工艺成本对比"})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["ruleId"] == rid
    assert body["confidence"] == pytest.approx(0.92, rel=0.01)
    assert body["rationale"]
    assert body["model"] == "claude-haiku-4-5"
    # Sanity: the rule list block should be in cached system prefix.
    assert any(blk.get("cache_control") == {"type": "ephemeral"} for blk in cap["system"])


def test_route_no_match(client, monkeypatch):
    _patch(monkeypatch, "rule_id=none;confidence=0.1;rationale=找不到匹配规则")
    res = client.post("/api/v1/route", json={"text": "随便问点什么"})
    assert res.status_code == 200
    body = res.json()
    assert body["ruleId"] is None
    assert body["deptId"] is None
    assert body["confidence"] == pytest.approx(0.1)


def test_route_empty_text_400(client):
    res = client.post("/api/v1/route", json={"text": "   "})
    assert res.status_code == 400


def test_route_unparseable_falls_to_none(client, monkeypatch):
    _patch(monkeypatch, "对不起,我无法解析。")
    res = client.post("/api/v1/route", json={"text": "测试"})
    assert res.status_code == 200
    assert res.json()["ruleId"] is None


def test_route_no_key_503(client, monkeypatch):
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: None)
    res = client.post("/api/v1/route", json={"text": "测试"})
    assert res.status_code == 503
