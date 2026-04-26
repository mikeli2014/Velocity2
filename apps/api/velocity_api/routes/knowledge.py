"""Company Knowledge Center — domain registry + aggregate overview.

Per PRD §5.1, the Knowledge Center is the company's single source of
"统一上下文 (unified context)" — every Skill / Workflow / Strategy debate
ultimately RAGs against these domains and sources. The frontend's
``KnowledgePage`` already shapes around this concept; these endpoints let
the page swap from local seed.js to live API.

Phase 1 surface area:

    GET  /api/v1/knowledge-domains      list domains (with optional scope filter)
    GET  /api/v1/knowledge-domains/{id} single domain
    PATCH /api/v1/knowledge-domains/{id} toggle enabled / update coverage
    GET  /api/v1/knowledge/overview     aggregate KPIs + domains + 5 most recent sources

Document upload, parser, embedding pipeline, and quality feedback all land
in Phase 2 alongside pgvector.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1", tags=["knowledge"])


# --- Domain registry -----------------------------------------------------


@router.get("/knowledge-domains", response_model=list[schemas.KnowledgeDomainOut])
def list_domains(
    scope: str | None = Query(default=None, description="company / department / project"),
    department_id: str | None = Query(default=None, alias="departmentId"),
    db: Session = Depends(get_db),
):
    q = db.query(models.KnowledgeDomain)
    if scope:
        q = q.filter(models.KnowledgeDomain.scope == scope)
    if department_id:
        q = q.filter(models.KnowledgeDomain.department_id == department_id)
    rows = q.order_by(models.KnowledgeDomain.id).all()
    return [schemas.KnowledgeDomainOut.model_validate(r) for r in rows]


@router.get("/knowledge-domains/{domain_id}", response_model=schemas.KnowledgeDomainOut)
def get_domain(domain_id: str, db: Session = Depends(get_db)):
    row = db.get(models.KnowledgeDomain, domain_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="domain_not_found")
    return schemas.KnowledgeDomainOut.model_validate(row)


class DomainPatch(BaseModel):
    enabled: bool | None = None
    coverage: int | None = None
    description: str | None = None


@router.patch("/knowledge-domains/{domain_id}", response_model=schemas.KnowledgeDomainOut)
def update_domain(
    domain_id: str,
    payload: DomainPatch,
    db: Session = Depends(get_db),
):
    row = db.get(models.KnowledgeDomain, domain_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="domain_not_found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return schemas.KnowledgeDomainOut.model_validate(row)


# --- Aggregate overview --------------------------------------------------


@router.get("/knowledge/overview", response_model=schemas.KnowledgeOverviewOut)
def knowledge_overview(db: Session = Depends(get_db)):
    """KPI strip + domain registry + recent sources in a single round-trip
    so the Knowledge Center landing tab loads with one request."""
    domains = db.query(models.KnowledgeDomain).order_by(models.KnowledgeDomain.id).all()
    sources = db.query(models.KnowledgeSource).order_by(models.KnowledgeSource.updated.desc()).all()

    total_sources = len(sources)
    total_embeddings = sum((s.embeddings or 0) for s in sources)
    total_uses = sum((s.uses or 0) for s in sources)
    pending_review = sum(1 for s in sources if (s.quality or "").lower() in ("review", "draft"))

    return schemas.KnowledgeOverviewOut(
        total_sources=total_sources,
        total_embeddings=total_embeddings,
        total_uses=total_uses,
        pending_review=pending_review,
        domains=[schemas.KnowledgeDomainOut.model_validate(d) for d in domains],
        recent_sources=[schemas.KnowledgeSourceOut.model_validate(s) for s in sources[:5]],
    )
