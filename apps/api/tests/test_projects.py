"""Project CRUD + audit log emission."""


def test_list_projects(client):
    res = client.get("/api/v1/projects")
    assert res.status_code == 200
    body = res.json()
    assert len(body) >= 4
    assert any(p["id"] == "proj-1" for p in body)


def test_get_project(client):
    res = client.get("/api/v1/projects/proj-1")
    assert res.status_code == 200
    body = res.json()
    assert body["name"]
    assert "milestones" in body


def test_get_project_404(client):
    res = client.get("/api/v1/projects/proj-missing")
    assert res.status_code == 404
    assert res.json()["detail"] == "project_not_found"


def test_create_project_emits_audit(client):
    before = len(client.get("/api/v1/audit-log", params={"category": "project"}).json())

    res = client.post("/api/v1/projects", json={
        "name": "测试项目 / Smoke",
        "owner": "ci",
        "deptId": "industrial-design",
        "okr": "O1",
        "milestones": [{"label": "M1", "due": "2026-08"}],
    })
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["name"] == "测试项目 / Smoke"
    assert body["id"].startswith("proj-")
    assert body["milestones"][0]["label"] == "M1"

    audit = client.get("/api/v1/audit-log", params={"category": "project"}).json()
    assert len(audit) == before + 1
    new_event = next(e for e in audit if e["target"] == "测试项目 / Smoke")
    assert new_event["action"] == "新增项目"
    assert new_event["link"]["projectId"] == body["id"]


def test_create_project_id_taken_409(client):
    res = client.post("/api/v1/projects", json={"id": "proj-1", "name": "dup"})
    assert res.status_code == 409
    assert res.json()["detail"] == "project_id_taken"


def test_patch_project(client):
    res = client.patch("/api/v1/projects/proj-1", json={
        "progress": 88,
        "health": "warn",
    })
    assert res.status_code == 200
    body = res.json()
    assert body["progress"] == 88
    assert body["health"] == "warn"

    audit = client.get("/api/v1/audit-log", params={"category": "project"}).json()
    assert any(e["action"] == "更新项目" for e in audit)


def test_delete_project(client):
    res = client.delete("/api/v1/projects/proj-2")
    assert res.status_code == 204
    assert client.get("/api/v1/projects/proj-2").status_code == 404

    audit = client.get("/api/v1/audit-log", params={"category": "project"}).json()
    assert any(e["action"] == "删除项目" for e in audit)


def test_project_404_paths(client):
    assert client.patch("/api/v1/projects/proj-missing", json={"progress": 1}).status_code == 404
    assert client.delete("/api/v1/projects/proj-missing").status_code == 404
