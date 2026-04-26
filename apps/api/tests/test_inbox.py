"""Ingest queue / Notifications / Routing rules / Audit log."""


# --- Ingest Queue ------------------------------------------------------


def test_list_ingest_queue(client):
    res = client.get("/api/v1/ingest-queue")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 8
    states = {it["state"] for it in body}
    assert {"parsing", "embedding", "tagging", "queued", "fetching", "review", "failed"}.issubset(states)


def test_filter_ingest_queue_by_state(client):
    res = client.get("/api/v1/ingest-queue", params={"state": "review"})
    assert res.status_code == 200
    assert {it["id"] for it in res.json()} == {"iq-6", "iq-7"}


def test_create_ingest_item(client):
    res = client.post("/api/v1/ingest-queue", json={
        "name": "测试上传.pdf", "type": "PDF", "size": "1MB",
        "state": "queued", "scope": "公司", "owner": "ci"
    })
    assert res.status_code == 201
    body = res.json()
    assert body["name"] == "测试上传.pdf"
    assert body["uploaded"] == "刚刚"


def test_patch_ingest_item_state(client):
    res = client.patch("/api/v1/ingest-queue/iq-6", json={"state": "approved", "progress": 100})
    assert res.status_code == 200
    body = res.json()
    assert body["state"] == "approved"
    assert body["progress"] == 100


# --- Notifications -----------------------------------------------------


def test_list_notifications(client):
    res = client.get("/api/v1/notifications")
    assert res.status_code == 200
    assert len(res.json()) == 6


def test_list_unread_only(client):
    res = client.get("/api/v1/notifications", params={"unreadOnly": "true"})
    assert res.status_code == 200
    body = res.json()
    # Three are unread in seed (n-1, n-2, n-3).
    assert {n["id"] for n in body} == {"n-1", "n-2", "n-3"}


def test_mark_notification_read(client):
    res = client.post("/api/v1/notifications/n-1/read")
    assert res.status_code == 200
    assert res.json()["read"] is True


def test_mark_all_read(client):
    res = client.post("/api/v1/notifications/mark-all-read")
    assert res.status_code == 200
    body = res.json()
    assert all(n["read"] for n in body)


# --- Routing rules -----------------------------------------------------


def test_list_routing_rules(client):
    res = client.get("/api/v1/routing-rules")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 8
    rt7 = next(r for r in body if r["id"] == "rt-7")
    assert rt7["enabled"] is False


def test_create_routing_rule_emits_audit(client):
    before = len(client.get("/api/v1/audit-log", params={"category": "routing"}).json())

    res = client.post("/api/v1/routing-rules", json={
        "intent": "测试 / 自动化 / 路由",
        "priority": "high",
        "targetDept": "industrial-design",
        "permission": "vp,lead,staff",
    })
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["intent"] == "测试 / 自动化 / 路由"
    assert body["priority"] == "high"
    assert body["enabled"] is True
    assert body["id"].startswith("rt-")
    assert body["hits"] == 0

    audit = client.get("/api/v1/audit-log", params={"category": "routing"}).json()
    assert len(audit) == before + 1
    new_event = next(e for e in audit if e["target"] == "测试 / 自动化 / 路由")
    assert new_event["action"] == "新增路由规则"
    assert new_event["link"]["ruleId"] == body["id"]


def test_create_routing_rule_id_taken_409(client):
    # rt-1 is in the seed.
    res = client.post("/api/v1/routing-rules", json={"id": "rt-1", "intent": "dup"})
    assert res.status_code == 409
    assert res.json()["detail"] == "routing_rule_id_taken"


def test_patch_routing_rule_toggle_enabled(client):
    # rt-1 is enabled in seed; flip it.
    res = client.patch("/api/v1/routing-rules/rt-1", json={"enabled": False})
    assert res.status_code == 200
    assert res.json()["enabled"] is False

    audit = client.get("/api/v1/audit-log", params={"category": "routing"}).json()
    assert any(e["action"] == "停用路由规则" for e in audit)


def test_patch_routing_rule_substantive_edit(client):
    res = client.patch("/api/v1/routing-rules/rt-2", json={
        "intent": "新意图描述",
        "priority": "high",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["intent"] == "新意图描述"
    assert body["priority"] == "high"

    audit = client.get("/api/v1/audit-log", params={"category": "routing"}).json()
    assert any(e["action"] == "更新路由规则" and e["target"] == "新意图描述" for e in audit)


def test_delete_routing_rule(client):
    res = client.delete("/api/v1/routing-rules/rt-3")
    assert res.status_code == 204

    after = {r["id"] for r in client.get("/api/v1/routing-rules").json()}
    assert "rt-3" not in after

    audit = client.get("/api/v1/audit-log", params={"category": "routing"}).json()
    assert any(e["action"] == "删除路由规则" for e in audit)


def test_routing_rule_404s(client):
    assert client.patch("/api/v1/routing-rules/rt-missing", json={"enabled": True}).status_code == 404
    assert client.delete("/api/v1/routing-rules/rt-missing").status_code == 404


# --- Audit log ---------------------------------------------------------


def test_list_audit(client):
    res = client.get("/api/v1/audit-log")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 12


def test_audit_filter_severity(client):
    res = client.get("/api/v1/audit-log", params={"severity": "danger"})
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["id"] == "au-11"


def test_audit_filter_category_limit(client):
    res = client.get("/api/v1/audit-log", params={"category": "knowledge", "limit": 1})
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 1
    assert body[0]["category"] == "knowledge"
