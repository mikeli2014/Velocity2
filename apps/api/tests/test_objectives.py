"""Happy-path coverage for the objectives CRUD."""


def test_list_objectives(client):
    res = client.get("/api/v1/objectives")
    assert res.status_code == 200
    body = res.json()
    assert len(body) == 4
    codes = [o["code"] for o in body]
    assert codes == ["O1", "O2", "O3", "O4"]
    # KRs come back nested
    assert len(body[0]["krs"]) == 3


def test_get_objective_404(client):
    res = client.get("/api/v1/objectives/nope")
    assert res.status_code == 404
    assert res.json()["detail"] == "objective_not_found"


def test_create_and_delete_objective(client):
    payload = {
        "code": "O5",
        "title": "测试 Objective",
        "owner": "测试用户",
        "quarter": "FY26",
        "krs": [
            {"title": "KR A", "target": "100", "current": "0", "progress": 0, "status": "on-track"},
            {"title": "KR B", "target": "50",  "current": "0", "progress": 50, "status": "on-track"},
        ],
    }
    res = client.post("/api/v1/objectives", json=payload)
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["code"] == "O5"
    assert body["progress"] == 25  # rolled up from KRs (0 + 50) / 2
    assert len(body["krs"]) == 2

    obj_id = body["id"]
    del_res = client.delete(f"/api/v1/objectives/{obj_id}")
    assert del_res.status_code == 204
    assert client.get(f"/api/v1/objectives/{obj_id}").status_code == 404


def test_patch_objective_replaces_krs(client):
    res = client.get("/api/v1/objectives/obj-3")
    obj = res.json()
    # Original has 2 KRs.
    assert len(obj["krs"]) == 2

    patch = {
        "title": "工业设计 — 中台升级版",
        "krs": [
            # Reuse one existing KR id (kr-3-1) to keep its row identity
            {"id": "kr-3-1", "title": "CMF 知识条目入库数", "target": "≥1500", "current": "1,200", "progress": 80, "status": "on-track"},
            # And one brand-new KR
            {"title": "Phase 3 上线品类数",                  "target": "9",     "current": "5",     "progress": 55, "status": "on-track"},
        ],
    }
    res2 = client.patch("/api/v1/objectives/obj-3", json=patch)
    assert res2.status_code == 200, res2.text
    obj2 = res2.json()
    assert obj2["title"] == "工业设计 — 中台升级版"
    assert len(obj2["krs"]) == 2
    # Progress rolled up automatically: (80 + 55) / 2 = 68 (rounded).
    assert obj2["progress"] == 68
