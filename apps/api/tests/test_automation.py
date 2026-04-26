"""Skill Packs / Workflows / Workflow Runs."""


def test_list_skill_packs(client):
    res = client.get("/api/v1/skill-packs")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 10
    ids = {s["id"] for s in body}
    assert "sp-design-brief" in ids
    assert "sp-doc-search" in ids


def test_filter_skill_packs_by_dept(client):
    res = client.get("/api/v1/skill-packs", params={"dept": "platform"})
    assert res.status_code == 200
    ids = {s["id"] for s in res.json()}
    assert ids == {"sp-doc-search", "sp-meeting-notes"}


def test_get_skill_pack_404(client):
    assert client.get("/api/v1/skill-packs/nope").status_code == 404


def test_list_workflows(client):
    res = client.get("/api/v1/workflows")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 6
    wf = next(w for w in body if w["id"] == "wf-design-brief")
    assert len(wf["steps"]) == 5
    assert "sp-design-brief" in wf["linkedSkills"]


def test_filter_workflows_by_dept(client):
    res = client.get("/api/v1/workflows", params={"deptId": "industrial-design"})
    assert res.status_code == 200
    assert {w["id"] for w in res.json()} == {"wf-design-brief", "wf-mat-compare"}


def test_list_workflow_runs(client):
    res = client.get("/api/v1/workflow-runs")
    assert res.status_code == 200
    assert len(res.json()) == 6


def test_filter_workflow_runs_by_workflow_id(client):
    res = client.get("/api/v1/workflow-runs", params={"workflowId": "wf-fault-triage"})
    assert res.status_code == 200
    assert {r["id"] for r in res.json()} == {"run-1"}


def test_create_workflow_run(client):
    payload = {
        "workflowId": "wf-design-brief",
        "trigger": "pytest e2e",
        "actor": "ci",
        "started": "11:00",
        "duration": "12s",
        "status": "ok",
        "output": "synthetic"
    }
    res = client.post("/api/v1/workflow-runs", json=payload)
    assert res.status_code == 201
    body = res.json()
    assert body["workflowId"] == "wf-design-brief"
    assert body["actor"] == "ci"
    # Visible in subsequent list call.
    listing = client.get("/api/v1/workflow-runs", params={"workflowId": "wf-design-brief"})
    assert any(r["id"] == body["id"] for r in listing.json())


def test_create_workflow_run_404_when_workflow_missing(client):
    res = client.post("/api/v1/workflow-runs", json={"workflowId": "nope"})
    assert res.status_code == 404
