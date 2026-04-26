"""Activity feed / Agents / Strategy Questions endpoints."""


def test_list_activity(client):
    res = client.get("/api/v1/activity")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 6
    assert {row["type"] for row in body} >= {"project", "assistant", "risk", "strategy", "knowledge", "view"}


def test_list_activity_limit(client):
    res = client.get("/api/v1/activity", params={"limit": 3})
    assert res.status_code == 200
    assert len(res.json()) == 3


def test_list_agents(client):
    res = client.get("/api/v1/agents")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 8
    finance = next(a for a in body if a["id"] == "ag-finance")
    assert finance["name"] == "财务视角"
    assert finance["focus"]


def test_list_strategy_questions(client):
    res = client.get("/api/v1/strategy-questions")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 5
    sq1 = next(q for q in body if q["id"] == "sq-1")
    assert sq1["status"] == "in-debate"
    assert sq1["okrs"] == ["O1", "O2"]
    assert len(sq1["agents"]) == 7


def test_list_strategy_questions_filter_decided(client):
    res = client.get("/api/v1/strategy-questions", params={"status": "decided"})
    assert res.status_code == 200
    body = res.json()
    # sq-3 and sq-4 are decided in seed.
    assert {q["id"] for q in body} == {"sq-3", "sq-4"}


def test_get_strategy_question(client):
    res = client.get("/api/v1/strategy-questions/sq-1")
    assert res.status_code == 200
    body = res.json()
    assert body["title"].startswith("FY26 是否加大")
    assert body["rounds"] == 3


def test_get_strategy_question_404(client):
    assert client.get("/api/v1/strategy-questions/nope").status_code == 404
