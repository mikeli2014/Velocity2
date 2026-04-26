"""Catalog (read-only) endpoint coverage."""


def test_get_company(client):
    res = client.get("/api/v1/company")
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == "北海智能家居"
    assert body["nameEn"] == "Beihai Smart Home"
    # Knowledge profile fields exist with empty defaults.
    assert body["focusAreas"] == []
    assert body["competitors"] == []


def test_list_departments(client):
    res = client.get("/api/v1/departments")
    assert res.status_code == 200
    body = res.json()
    # Top-level + 2 + 3 levels deep — 25 departments total in seed.
    assert len(body) >= 24
    # Top-level rows surface first.
    top_level_ids = [d["id"] for d in body if d["parentId"] is None]
    assert "industrial-design" in top_level_ids


def test_list_projects(client):
    res = client.get("/api/v1/projects")
    assert res.status_code == 200
    assert len(res.json()) == 7


def test_get_project_includes_milestones(client):
    res = client.get("/api/v1/projects/proj-1")
    assert res.status_code == 200
    body = res.json()
    assert body["name"].startswith("全屋净水")
    assert len(body["milestones"]) >= 3
    assert body["linkedDecisions"] == ["d-1"]


def test_list_decisions_with_assumptions(client):
    res = client.get("/api/v1/decisions")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 3
    d1 = next(d for d in body if d["id"] == "d-1")
    assert len(d1["assumptions"]) == 2
    assert d1["evidenceSources"] == ["ks-1", "ks-2", "ks-4", "ks-8"]


def test_list_knowledge_sources(client):
    res = client.get("/api/v1/knowledge-sources")
    assert res.status_code == 200
    assert len(res.json()) == 8


def test_get_knowledge_source_404(client):
    assert client.get("/api/v1/knowledge-sources/nope").status_code == 404
