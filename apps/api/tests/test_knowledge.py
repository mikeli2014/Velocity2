"""Company Knowledge Center coverage."""


def test_list_domains(client):
    res = client.get("/api/v1/knowledge-domains")
    assert res.status_code == 200
    body = res.json()
    # 8 seeded company-level domains.
    assert len(body) == 8
    cmf = next(d for d in body if d["id"] == "kd-cmf")
    assert cmf["count"] == 1046
    assert cmf["scope"] == "company"


def test_list_domains_filtered_by_scope(client):
    res = client.get("/api/v1/knowledge-domains", params={"scope": "department"})
    assert res.status_code == 200
    # Phase 1 seed has no department-scoped domains.
    assert res.json() == []


def test_patch_domain_toggle_enabled(client):
    res = client.patch("/api/v1/knowledge-domains/kd-supplier", json={"enabled": False})
    assert res.status_code == 200
    assert res.json()["enabled"] is False


def test_overview_aggregates(client):
    res = client.get("/api/v1/knowledge/overview")
    assert res.status_code == 200
    body = res.json()
    # 8 seeded sources.
    assert body["totalSources"] == 8
    # Sum of embeddings across all sources (412+196+76+824+1206+38+12+168 = 2932)
    assert body["totalEmbeddings"] == 2932
    # Two sources are "review"/"draft" (ks-3 review, ks-6 draft).
    assert body["pendingReview"] == 2
    assert len(body["domains"]) == 8
    assert len(body["recentSources"]) == 5  # most-recent slice


def test_patch_domain_404(client):
    res = client.patch("/api/v1/knowledge-domains/nope", json={"enabled": False})
    assert res.status_code == 404
