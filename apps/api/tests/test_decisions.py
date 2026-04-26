"""Decision CRUD + audit log emission."""


def test_list_decisions(client):
    res = client.get("/api/v1/decisions")
    assert res.status_code == 200
    body = res.json()
    assert len(body) >= 1
    # Ordered by date desc.
    if len(body) > 1:
        assert body[0]["date"] >= body[-1]["date"]


def test_get_decision(client):
    res = client.get("/api/v1/decisions/d-1")
    assert res.status_code == 200
    assert res.json()["id"] == "d-1"


def test_get_decision_404(client):
    assert client.get("/api/v1/decisions/d-missing").status_code == 404


def test_create_decision_emits_audit(client):
    before = len(client.get("/api/v1/audit-log", params={"category": "decision"}).json())

    res = client.post("/api/v1/decisions", json={
        "title": "Smoke 决策",
        "owner": "ci",
        "date": "2026-04-26",
        "status": "decided",
        "linkedKr": "kr-1-1",
        "assumptions": ["A1", "A2"],
    })
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["title"] == "Smoke 决策"
    assert body["assumptions"] == ["A1", "A2"]
    assert body["id"].startswith("d-")

    audit = client.get("/api/v1/audit-log", params={"category": "decision"}).json()
    assert len(audit) == before + 1
    new_event = next(e for e in audit if e["target"] == "Smoke 决策")
    assert new_event["action"] == "新增决策"
    assert new_event["link"]["decisionId"] == body["id"]


def test_create_decision_id_taken_409(client):
    res = client.post("/api/v1/decisions", json={"id": "d-1", "title": "dup"})
    assert res.status_code == 409


def test_patch_decision(client):
    res = client.patch("/api/v1/decisions/d-1", json={
        "conclusion": "更新后的结论",
        "status": "review",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["conclusion"] == "更新后的结论"
    assert body["status"] == "review"


def test_delete_decision(client):
    res = client.delete("/api/v1/decisions/d-2")
    assert res.status_code == 204
    assert client.get("/api/v1/decisions/d-2").status_code == 404

    audit = client.get("/api/v1/audit-log", params={"category": "decision"}).json()
    assert any(e["action"] == "删除决策" for e in audit)


def test_decision_404_paths(client):
    assert client.patch("/api/v1/decisions/d-missing", json={"title": "x"}).status_code == 404
    assert client.delete("/api/v1/decisions/d-missing").status_code == 404
