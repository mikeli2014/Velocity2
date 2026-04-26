def test_healthz_plain(client):
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.text.strip() == "ok"


def test_health_json(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["database"] == "sqlite"
    # Seed loader inserted 4 objectives.
    assert body["objectiveCount"] == 4
