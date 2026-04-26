"""KnowledgeSource CRUD + audit log emission."""


def test_list_knowledge_sources(client):
    res = client.get("/api/v1/knowledge-sources")
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_get_knowledge_source(client):
    res = client.get("/api/v1/knowledge-sources/ks-1")
    assert res.status_code == 200
    assert res.json()["id"] == "ks-1"


def test_get_knowledge_source_404(client):
    assert client.get("/api/v1/knowledge-sources/ks-missing").status_code == 404


def test_create_knowledge_source_emits_audit(client):
    before = len(client.get("/api/v1/audit-log", params={"category": "knowledge"}).json())

    res = client.post("/api/v1/knowledge-sources", json={
        "title": "测试上传 · 全屋净水设计简报",
        "type": "PDF",
        "scope": "公司",
        "quality": "draft",
        "owner": "ci",
        "summary": "Smoke",
        "tags": ["test"],
    })
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["title"] == "测试上传 · 全屋净水设计简报"
    assert body["id"].startswith("ks-")
    assert body["quality"] == "draft"

    audit = client.get("/api/v1/audit-log", params={"category": "knowledge"}).json()
    assert len(audit) == before + 1
    new_event = next(e for e in audit if e["target"] == "测试上传 · 全屋净水设计简报")
    assert new_event["action"] == "新增知识源"
    assert new_event["link"]["sourceId"] == body["id"]


def test_create_knowledge_source_id_taken_409(client):
    res = client.post("/api/v1/knowledge-sources", json={"id": "ks-1", "title": "dup"})
    assert res.status_code == 409


def test_patch_knowledge_source(client):
    res = client.patch("/api/v1/knowledge-sources/ks-1", json={
        "quality": "verified",
        "uses": 999,
    })
    assert res.status_code == 200
    body = res.json()
    assert body["quality"] == "verified"
    assert body["uses"] == 999


def test_delete_knowledge_source(client):
    res = client.delete("/api/v1/knowledge-sources/ks-2")
    assert res.status_code == 204
    assert client.get("/api/v1/knowledge-sources/ks-2").status_code == 404

    audit = client.get("/api/v1/audit-log", params={"category": "knowledge"}).json()
    assert any(e["action"] == "删除知识源" for e in audit)


def test_knowledge_source_404_paths(client):
    assert client.patch("/api/v1/knowledge-sources/ks-missing", json={"quality": "x"}).status_code == 404
    assert client.delete("/api/v1/knowledge-sources/ks-missing").status_code == 404
