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
