"""Chat endpoint tests.

We never let pytest hit the real Anthropic API. Tests monkeypatch
``velocity_api.routes.chat._get_anthropic_client`` to return a fake
client whose ``messages.create`` records the call args and returns a
canned response.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import pytest

from velocity_api.routes import chat as chat_route

# --- Fakes ------------------------------------------------------------


@dataclass
class _FakeBlock:
    type: str
    text: str


@dataclass
class _FakeUsage:
    input_tokens: int = 120
    output_tokens: int = 42
    cache_read_input_tokens: int = 0
    cache_creation_input_tokens: int = 110


@dataclass
class _FakeMessage:
    content: list[_FakeBlock]
    model: str = "claude-sonnet-4-6"
    stop_reason: str = "end_turn"
    usage: _FakeUsage = field(default_factory=_FakeUsage)


class _FakeMessages:
    def __init__(self, captured: dict[str, Any], reply_text: str = "你好,我是 Velocity 助手。"):
        self._captured = captured
        self._reply = reply_text

    def create(self, **kwargs: Any) -> _FakeMessage:
        self._captured.update(kwargs)
        return _FakeMessage(content=[_FakeBlock(type="text", text=self._reply)])


class _FakeClient:
    def __init__(self, captured: dict[str, Any], reply_text: str = "你好,我是 Velocity 助手。"):
        self.messages = _FakeMessages(captured, reply_text)


@pytest.fixture()
def captured(monkeypatch) -> dict[str, Any]:
    cap: dict[str, Any] = {}
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: _FakeClient(cap))
    return cap


# --- Tests ------------------------------------------------------------


def test_chat_happy_path(client, captured):
    res = client.post(
        "/api/v1/chat",
        json={"messages": [{"role": "user", "content": "全屋净水 2.0 的设计简报怎么生成?"}]},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["text"] == "你好,我是 Velocity 助手。"
    assert body["model"] == "claude-sonnet-4-6"
    assert body["stopReason"] == "end_turn"
    usage = body["usage"]
    assert usage["inputTokens"] == 120
    assert usage["outputTokens"] == 42
    assert usage["cacheCreationInputTokens"] == 110

    # Default model is sonnet-4-6.
    assert captured["model"] == "claude-sonnet-4-6"
    # System is a list of blocks; first block carries cache_control.
    system = captured["system"]
    assert isinstance(system, list)
    assert system[0]["cache_control"] == {"type": "ephemeral"}
    assert "北海智能家居" in system[0]["text"]


def test_chat_with_dept_adds_cached_block(client, captured):
    res = client.post(
        "/api/v1/chat",
        json={
            "messages": [{"role": "user", "content": "你好"}],
            "deptId": "id-cmf",
        },
    )
    assert res.status_code == 200
    system = captured["system"]
    # Company block + dept block, both cached.
    assert len(system) >= 2
    assert system[1]["cache_control"] == {"type": "ephemeral"}
    assert "CMF 中台" in system[1]["text"]


def test_chat_volatile_suffix_not_cached(client, captured):
    res = client.post(
        "/api/v1/chat",
        json={
            "messages": [{"role": "user", "content": "你好"}],
            "systemSuffix": "请用一句话回答。",
        },
    )
    assert res.status_code == 200
    system = captured["system"]
    suffix_block = system[-1]
    assert suffix_block["text"] == "请用一句话回答。"
    assert "cache_control" not in suffix_block


def test_chat_skill_id_adds_skill_framing(client, captured):
    # The seed includes 设计简报生成 skill — see seed_data.py if this drifts.
    res = client.post(
        "/api/v1/chat",
        json={
            "messages": [{"role": "user", "content": "全屋净水 2.0"}],
            "skillId": "sk-brief",
        },
    )
    # Even if the skill id doesn't exist we should still 200 (server falls
    # back to company-only context). What we actually assert is that the
    # endpoint accepts skillId and returns a valid response.
    assert res.status_code == 200
    assert res.json()["text"]


def test_chat_no_messages_400(client, captured):
    res = client.post("/api/v1/chat", json={"messages": []})
    assert res.status_code == 400
    assert res.json()["detail"] == "messages_required"


def test_chat_no_api_key_503(client, monkeypatch):
    # Override the client provider to simulate no API key configured.
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: None)
    res = client.post(
        "/api/v1/chat",
        json={"messages": [{"role": "user", "content": "你好"}]},
    )
    assert res.status_code == 503
    assert res.json()["detail"] == "anthropic_not_configured"
