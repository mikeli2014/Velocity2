"""Decision CRUD.

Mirrors ``projects.py`` — full CRUD + audit emissions. ``decision``
audit category, ``link.decisionId`` deep-link.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..audit import emit_audit
from ..db import get_db

router = APIRouter(prefix="/api/v1/decisions", tags=["decisions"])


@router.get("", response_model=list[schemas.DecisionOut])
def list_decisions(db: Session = Depends(get_db)):
    rows = db.query(models.Decision).order_by(models.Decision.date.desc()).all()
    return [schemas.DecisionOut.model_validate(r) for r in rows]


@router.get("/{decision_id}", response_model=schemas.DecisionOut)
def get_decision(decision_id: str, db: Session = Depends(get_db)):
    row = db.get(models.Decision, decision_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="decision_not_found")
    return schemas.DecisionOut.model_validate(row)


@router.post("", response_model=schemas.DecisionOut, status_code=status.HTTP_201_CREATED)
def create_decision(payload: schemas.DecisionCreate, db: Session = Depends(get_db)):
    decision_id = payload.id or schemas.make_id("d")
    if db.get(models.Decision, decision_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="decision_id_taken")

    data = payload.model_dump(by_alias=False)
    data["id"] = decision_id

    row = models.Decision(**data)
    db.add(row)
    emit_audit(
        db,
        category="decision",
        severity="info",
        action="新增决策",
        target=payload.title,
        link={"page": "okr", "decisionId": decision_id},
    )
    db.commit()
    db.refresh(row)
    return schemas.DecisionOut.model_validate(row)


@router.patch("/{decision_id}", response_model=schemas.DecisionOut)
def update_decision(
    decision_id: str,
    payload: schemas.DecisionUpdate,
    db: Session = Depends(get_db),
):
    row = db.get(models.Decision, decision_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="decision_not_found")

    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(row, field, value)

    emit_audit(
        db,
        category="decision",
        severity="info",
        action="更新决策",
        target=row.title,
        link={"page": "okr", "decisionId": decision_id},
    )
    db.commit()
    db.refresh(row)
    return schemas.DecisionOut.model_validate(row)


@router.delete("/{decision_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_decision(decision_id: str, db: Session = Depends(get_db)):
    row = db.get(models.Decision, decision_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="decision_not_found")
    title = row.title
    db.delete(row)
    emit_audit(
        db,
        category="decision",
        severity="warning",
        action="删除决策",
        target=title,
    )
    db.commit()
    return None
