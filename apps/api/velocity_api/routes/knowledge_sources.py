"""KnowledgeSource CRUD.

Backend-only this round — no frontend caller yet (the existing
``KnowledgePage`` upload modal still pushes to ``IngestQueue``). These
endpoints are wired so the future ingest-queue → source promotion flow
(Phase 2 step E) can call ``POST /knowledge-sources`` once the operator
approves a queued item.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..audit import emit_audit
from ..db import get_db

router = APIRouter(prefix="/api/v1/knowledge-sources", tags=["knowledge"])


@router.get("", response_model=list[schemas.KnowledgeSourceOut])
def list_knowledge_sources(db: Session = Depends(get_db)):
    rows = db.query(models.KnowledgeSource).order_by(models.KnowledgeSource.id).all()
    return [schemas.KnowledgeSourceOut.model_validate(r) for r in rows]


@router.get("/{source_id}", response_model=schemas.KnowledgeSourceOut)
def get_knowledge_source(source_id: str, db: Session = Depends(get_db)):
    row = db.get(models.KnowledgeSource, source_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="source_not_found")
    return schemas.KnowledgeSourceOut.model_validate(row)


@router.post("", response_model=schemas.KnowledgeSourceOut, status_code=status.HTTP_201_CREATED)
def create_knowledge_source(payload: schemas.KnowledgeSourceCreate, db: Session = Depends(get_db)):
    source_id = payload.id or schemas.make_id("ks")
    if db.get(models.KnowledgeSource, source_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="source_id_taken")

    data = payload.model_dump(by_alias=False)
    data["id"] = source_id

    row = models.KnowledgeSource(**data)
    db.add(row)
    emit_audit(
        db,
        category="knowledge",
        severity="info",
        action="新增知识源",
        target=payload.title,
        scope=payload.scope,
        link={"page": "knowledge", "sourceId": source_id},
    )
    db.commit()
    db.refresh(row)
    return schemas.KnowledgeSourceOut.model_validate(row)


@router.patch("/{source_id}", response_model=schemas.KnowledgeSourceOut)
def update_knowledge_source(
    source_id: str,
    payload: schemas.KnowledgeSourceUpdate,
    db: Session = Depends(get_db),
):
    row = db.get(models.KnowledgeSource, source_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="source_not_found")

    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(row, field, value)

    emit_audit(
        db,
        category="knowledge",
        severity="info",
        action="更新知识源",
        target=row.title,
        scope=row.scope,
        link={"page": "knowledge", "sourceId": source_id},
    )
    db.commit()
    db.refresh(row)
    return schemas.KnowledgeSourceOut.model_validate(row)


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_source(source_id: str, db: Session = Depends(get_db)):
    row = db.get(models.KnowledgeSource, source_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="source_not_found")
    title = row.title
    scope = row.scope
    db.delete(row)
    emit_audit(
        db,
        category="knowledge",
        severity="warning",
        action="删除知识源",
        target=title,
        scope=scope,
    )
    db.commit()
    return None
