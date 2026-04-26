"""X-User-Id auth stub tests.

The stub reads the ``X-User-Id`` header on every request, falls back
to the demo default (``陈志远`` — Beihai's CEO from the seed) and
threads the value into ``audit.emit_audit`` as the ``actor`` field.

HTTP headers must be ASCII per RFC 7230, so the X-User-Id value is
expected to be an opaque ASCII identifier (``"chen-zhiyuan"``,
``"susan@beihai"``, etc.) — display-name resolution would happen via
the Departments table when a real auth flow lands. We test with ASCII
ids and verify the server default for the no-header case.
"""


def test_audit_actor_defaults_to_ceo(client):
    # No X-User-Id → audit row uses the Chinese DEFAULT_ACTOR set
    # server-side (never crosses an HTTP header).
    res = client.post("/api/v1/projects", json={"name": "auth default"})
    assert res.status_code == 201

    audit = client.get("/api/v1/audit-log", params={"category": "project"}).json()
    new_event = next(e for e in audit if e["target"] == "auth default")
    assert new_event["actor"] == "陈志远"


def test_audit_actor_uses_x_user_id_header(client):
    res = client.post(
        "/api/v1/projects",
        json={"name": "auth custom"},
        headers={"X-User-Id": "su-wan"},
    )
    assert res.status_code == 201

    audit = client.get("/api/v1/audit-log", params={"category": "project"}).json()
    new_event = next(e for e in audit if e["target"] == "auth custom")
    assert new_event["actor"] == "su-wan"


def test_audit_actor_strips_whitespace(client):
    res = client.post(
        "/api/v1/decisions",
        json={"title": "auth ws"},
        headers={"X-User-Id": "  li-mubai  "},
    )
    assert res.status_code == 201
    audit = client.get("/api/v1/audit-log", params={"category": "decision"}).json()
    new_event = next(e for e in audit if e["target"] == "auth ws")
    assert new_event["actor"] == "li-mubai"


def test_audit_actor_threads_through_routing_rules(client):
    res = client.post(
        "/api/v1/routing-rules",
        json={"intent": "auth-test rule"},
        headers={"X-User-Id": "zhou-lan"},
    )
    assert res.status_code == 201
    audit = client.get("/api/v1/audit-log", params={"category": "routing"}).json()
    new_event = next(e for e in audit if e["target"] == "auth-test rule")
    assert new_event["actor"] == "zhou-lan"


def test_audit_actor_empty_header_falls_back_to_default(client):
    res = client.post(
        "/api/v1/projects",
        json={"name": "auth empty"},
        headers={"X-User-Id": "   "},
    )
    assert res.status_code == 201
    audit = client.get("/api/v1/audit-log", params={"category": "project"}).json()
    new_event = next(e for e in audit if e["target"] == "auth empty")
    assert new_event["actor"] == "陈志远"
