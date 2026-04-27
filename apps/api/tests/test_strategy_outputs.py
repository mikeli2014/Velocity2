"""Strategy options + structured-output generator tests.

Both endpoints call Claude once and parse JSON out of the response.
We monkeypatch the chat module's anthropic client so pytest never
hits the network.
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
    output_tokens: int = 60
    cache_read_input_tokens: int = 80
    cache_creation_input_tokens: int = 0


@dataclass
class _FakeMessage:
    content: list[_FakeBlock]
    model: str = "claude-sonnet-4-6"
    stop_reason: str = "end_turn"
    usage: _FakeUsage = field(default_factory=_FakeUsage)


class _FakeMessages:
    def __init__(self, captured: dict[str, Any], reply_text: str):
        self._captured = captured
        self._reply = reply_text

    def create(self, **kwargs: Any) -> _FakeMessage:
        self._captured.update(kwargs)
        return _FakeMessage(content=[_FakeBlock(type="text", text=self._reply)])


class _FakeClient:
    def __init__(self, captured: dict[str, Any], reply_text: str):
        self.messages = _FakeMessages(captured, reply_text)


def _patch(monkeypatch, reply: str) -> dict[str, Any]:
    cap: dict[str, Any] = {}
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: _FakeClient(cap, reply))
    return cap


# --- Options ----------------------------------------------------------


_OPTIONS_REPLY = json.dumps({
    "options": [
        {
            "name": "选项 A · 激进切换",
            "description": "DTC 占比 Q4 达到 35%。",
            "roi": "高", "risk": "高",
            "time": "Q2 启动 / Q4 见效",
            "pros": 3, "cons": 2, "recommended": False,
        },
        {
            "name": "选项 B · 稳健并行",
            "description": "DTC 占比 22%,2 城试点。",
            "roi": "中", "risk": "中",
            "time": "Q2 试点 / Q3 复制",
            "pros": 5, "cons": 1, "recommended": True,
        },
    ]
}, ensure_ascii=False)


def test_options_list_empty(client):
    res = client.get("/api/v1/strategy-questions/sq-1/options")
    assert res.status_code == 200
    assert res.json() == []


def test_options_generate_persists_and_lists(client, monkeypatch):
    cap = _patch(monkeypatch, _OPTIONS_REPLY)
    gen = client.post("/api/v1/strategy-questions/sq-1/options/generate")
    assert gen.status_code == 201, gen.text
    body = gen.json()
    assert len(body) == 2
    assert body[1]["recommended"] is True
    assert body[1]["pros"] == 5
    assert body[0]["model"] == "claude-sonnet-4-6"
    # System prefix uses cached company + debate-summary blocks.
    sys = cap["system"]
    assert sys[0]["cache_control"] == {"type": "ephemeral"}
    assert sys[1]["cache_control"] == {"type": "ephemeral"}

    # Listed back via GET.
    listed = client.get("/api/v1/strategy-questions/sq-1/options").json()
    assert len(listed) == 2
    assert listed[1]["name"].startswith("选项 B")


def test_options_generate_replaces_prior_run(client, monkeypatch):
    _patch(monkeypatch, _OPTIONS_REPLY)
    client.post("/api/v1/strategy-questions/sq-1/options/generate")
    assert len(client.get("/api/v1/strategy-questions/sq-1/options").json()) == 2

    # Second run with a single-option reply should leave only 1 row.
    _patch(monkeypatch, json.dumps({
        "options": [{"name": "选项 X", "description": "x", "roi": "中", "risk": "中",
                     "time": "—", "pros": 1, "cons": 1, "recommended": True}]
    }, ensure_ascii=False))
    client.post("/api/v1/strategy-questions/sq-1/options/generate")
    after = client.get("/api/v1/strategy-questions/sq-1/options").json()
    assert len(after) == 1
    assert after[0]["name"] == "选项 X"


def test_options_generate_404(client, monkeypatch):
    _patch(monkeypatch, _OPTIONS_REPLY)
    res = client.post("/api/v1/strategy-questions/sq-missing/options/generate")
    assert res.status_code == 404


def test_options_generate_no_key_503(client, monkeypatch):
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: None)
    res = client.post("/api/v1/strategy-questions/sq-1/options/generate")
    assert res.status_code == 503


def test_options_generate_handles_fenced_json(client, monkeypatch):
    fenced = "```json\n" + _OPTIONS_REPLY + "\n```"
    _patch(monkeypatch, fenced)
    res = client.post("/api/v1/strategy-questions/sq-1/options/generate")
    assert res.status_code == 201
    assert len(res.json()) == 2


def test_options_generate_garbage_502(client, monkeypatch):
    _patch(monkeypatch, "对不起,我没法生成选项。")
    res = client.post("/api/v1/strategy-questions/sq-1/options/generate")
    assert res.status_code == 502
    assert res.json()["detail"] == "options_parse_failed"


# --- Structured output ------------------------------------------------


_STRUCT_REPLY = json.dumps({
    "objective": {
        "code": "O5",
        "title": "FY26 把线上 DTC 打造为全屋净水套系的主力增长引擎",
        "krs": [
            {"kr": "KR1 · 线上 DTC 占比", "target": "≥ 22%"},
            {"kr": "KR2 · 套系客单价", "target": "≥ ¥18,000"},
        ]
    },
    "projects": [
        {"name": "DTC 旗舰内容工厂搭建", "owner": "Anna 林 · 市场部", "milestone": "5 月样板间直播首秀"},
        {"name": "县域服务网络铺设", "owner": "王锐 · 服务部", "milestone": "Q2 完成 SC 选型"},
    ],
    "decision": {
        "question": "FY26 是否加大线上 DTC 渠道投入?",
        "conclusion": "选择稳健并行方案。",
        "assumptions": ["县域履约能力可在 Q2 完成铺设"],
        "dissent": ["风险视角(渠道冲突)"],
        "evidence": "7 条公司知识、3 条市场数据。"
    }
}, ensure_ascii=False)


def test_structured_output_generate_happy(client, monkeypatch):
    _patch(monkeypatch, _STRUCT_REPLY)
    res = client.post("/api/v1/strategy-questions/sq-1/structured-output/generate")
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["objective"]["code"] == "O5"
    assert len(body["objective"]["krs"]) == 2
    assert len(body["projects"]) == 2
    assert body["decision"]["assumptions"] == ["县域履约能力可在 Q2 完成铺设"]
    assert body["model"] == "claude-sonnet-4-6"


def test_structured_output_404(client, monkeypatch):
    _patch(monkeypatch, _STRUCT_REPLY)
    res = client.post("/api/v1/strategy-questions/sq-missing/structured-output/generate")
    assert res.status_code == 404


def test_structured_output_no_key_503(client, monkeypatch):
    monkeypatch.setattr(chat_route, "_get_anthropic_client", lambda: None)
    res = client.post("/api/v1/strategy-questions/sq-1/structured-output/generate")
    assert res.status_code == 503


def test_structured_output_anchors_on_recommended_option(client, monkeypatch):
    # First generate options; one is recommended.
    _patch(monkeypatch, _OPTIONS_REPLY)
    client.post("/api/v1/strategy-questions/sq-1/options/generate")

    cap = _patch(monkeypatch, _STRUCT_REPLY)
    res = client.post("/api/v1/strategy-questions/sq-1/structured-output/generate")
    assert res.status_code == 200
    body = res.json()
    # When options exist and we don't pick one, the response carries the
    # recommended option id back.
    assert body["recommendedOptionId"] is not None
    # System prefix has 3 cached blocks: company + debate + chosen-option.
    assert sum(1 for b in cap["system"] if b.get("cache_control")) == 3


def test_structured_output_garbage_502(client, monkeypatch):
    _patch(monkeypatch, "我无法生成。")
    res = client.post("/api/v1/strategy-questions/sq-1/structured-output/generate")
    assert res.status_code == 502
