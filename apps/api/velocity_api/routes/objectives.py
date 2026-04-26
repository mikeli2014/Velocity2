"""Objective + KR CRUD.

The KR list on an Objective is treated as part of the Objective document:
- POST creates the Objective and any inline KRs in one transaction.
- PATCH with a ``krs`` field replaces the KR set wholesale (server diffs by
  ``id`` so unchanged KRs keep their row identity; new KRs without an id are
  inserted; missing IDs are deleted via ORM cascade).
- DELETE on the Objective cascades KR removal via ``cascade="all, delete-orphan"``.

Progress is auto-rolled-up from KRs on every write — the client never has
to send Objective.progress, but if it does we recompute anyway.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1/objectives", tags=["objectives"])


def _rollup(progress_values: list[int]) -> int:
    if not progress_values:
        return 0
    return round(sum(progress_values) / len(progress_values))


def _objective_to_out(obj: models.Objective) -> schemas.ObjectiveOut:
    return schemas.ObjectiveOut.model_validate(
        {
            "id": obj.id,
            "code": obj.code,
            "title": obj.title,
            "owner": obj.owner,
            "progress": obj.progress,
            "status": obj.status,
            "quarter": obj.quarter,
            "linked_projects": obj.linked_projects or [],
            "krs": [
                {
                    "id": k.id,
                    "title": k.title,
                    "target": k.target,
                    "current": k.current,
                    "progress": k.progress,
                    "status": k.status,
                }
                for k in obj.krs
            ],
        }
    )


@router.get("", response_model=list[schemas.ObjectiveOut])
def list_objectives(db: Session = Depends(get_db)):
    rows = db.query(models.Objective).options(selectinload(models.Objective.krs)).order_by(models.Objective.code).all()
    return [_objective_to_out(o) for o in rows]


@router.get("/{objective_id}", response_model=schemas.ObjectiveOut)
def get_objective(objective_id: str, db: Session = Depends(get_db)):
    obj = db.get(models.Objective, objective_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="objective_not_found")
    return _objective_to_out(obj)


@router.post("", response_model=schemas.ObjectiveOut, status_code=status.HTTP_201_CREATED)
def create_objective(payload: schemas.ObjectiveCreate, db: Session = Depends(get_db)):
    obj_id = payload.id or schemas.make_id("obj")
    if db.get(models.Objective, obj_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="objective_id_taken")

    krs = [
        models.KeyResult(
            id=(k.id or schemas.make_id("kr")),
            title=k.title,
            target=k.target,
            current=k.current,
            progress=k.progress,
            status=k.status,
        )
        for k in payload.krs
    ]
    obj = models.Objective(
        id=obj_id,
        code=payload.code,
        title=payload.title,
        owner=payload.owner,
        progress=_rollup([k.progress for k in krs]) if krs else (payload.progress or 0),
        status=payload.status,
        quarter=payload.quarter,
        linked_projects=list(payload.linked_projects or []),
        krs=krs,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return _objective_to_out(obj)


@router.patch("/{objective_id}", response_model=schemas.ObjectiveOut)
def update_objective(
    objective_id: str,
    payload: schemas.ObjectiveUpdate,
    db: Session = Depends(get_db),
):
    obj = db.get(models.Objective, objective_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="objective_not_found")

    data = payload.model_dump(exclude_unset=True, by_alias=False)

    # KR diff: replace wholesale, but reuse rows by id to preserve identity.
    if "krs" in data:
        incoming = data.pop("krs") or []
        existing = {k.id: k for k in obj.krs}
        keep_ids: set[str] = set()
        new_krs: list[models.KeyResult] = []
        for k in incoming:
            kr_id = k.get("id") or schemas.make_id("kr")
            keep_ids.add(kr_id)
            row = existing.get(kr_id)
            if row is None:
                row = models.KeyResult(id=kr_id, objective_id=obj.id)
            row.title = k["title"]
            row.target = k.get("target")
            row.current = k.get("current")
            row.progress = k.get("progress", 0)
            row.status = k.get("status")
            new_krs.append(row)
        # Drop rows not in the incoming set.
        for old_id, old_row in existing.items():
            if old_id not in keep_ids:
                db.delete(old_row)
        obj.krs = new_krs
        # Always rollup when KRs change, ignoring any client-sent `progress`.
        data["progress"] = _rollup([k.progress for k in new_krs])

    for field, value in data.items():
        setattr(obj, field, value)

    db.commit()
    db.refresh(obj)
    return _objective_to_out(obj)


@router.delete("/{objective_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_objective(objective_id: str, db: Session = Depends(get_db)):
    obj = db.get(models.Objective, objective_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="objective_not_found")
    db.delete(obj)
    db.commit()
    return None
