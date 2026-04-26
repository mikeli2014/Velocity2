"""Read-only listing endpoints for the catalog-style entities the frontend
currently keeps in seed.js. These return everything (no pagination yet);
each list is well under 100 rows in the demo.

When/if write paths are needed for these, promote each to its own module
matching the objectives.py shape.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1", tags=["catalog"])


@router.get("/company", response_model=schemas.CompanyOut)
def get_company(db: Session = Depends(get_db)):
    row = db.query(models.Company).first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="company_not_found")
    return schemas.CompanyOut.model_validate(row)


@router.get("/departments", response_model=list[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    rows = db.query(models.Department).order_by(models.Department.parent_id.is_(None).desc(), models.Department.id).all()
    return [schemas.DepartmentOut.model_validate(r) for r in rows]


@router.get("/projects", response_model=list[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    rows = db.query(models.Project).order_by(models.Project.id).all()
    return [schemas.ProjectOut.model_validate(r) for r in rows]


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    row = db.get(models.Project, project_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project_not_found")
    return schemas.ProjectOut.model_validate(row)


@router.get("/decisions", response_model=list[schemas.DecisionOut])
def list_decisions(db: Session = Depends(get_db)):
    rows = db.query(models.Decision).order_by(models.Decision.date.desc()).all()
    return [schemas.DecisionOut.model_validate(r) for r in rows]


@router.get("/knowledge-sources", response_model=list[schemas.KnowledgeSourceOut])
def list_knowledge_sources(db: Session = Depends(get_db)):
    rows = db.query(models.KnowledgeSource).order_by(models.KnowledgeSource.id).all()
    return [schemas.KnowledgeSourceOut.model_validate(r) for r in rows]


@router.get("/knowledge-sources/{source_id}", response_model=schemas.KnowledgeSourceOut)
def get_knowledge_source(source_id: str, db: Session = Depends(get_db)):
    row = db.get(models.KnowledgeSource, source_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="source_not_found")
    return schemas.KnowledgeSourceOut.model_validate(row)


# --- Activity / Agents / Strategy Questions -----------------------------


@router.get("/activity", response_model=list[schemas.ActivityOut])
def list_activity(
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Home page activity feed. Phase 1 returns the seeded sample; Phase 2
    will write entries from audit triggers."""
    rows = db.query(models.Activity).limit(limit).all()
    return [schemas.ActivityOut.model_validate(r) for r in rows]


@router.get("/agents", response_model=list[schemas.AgentOut])
def list_agents(db: Session = Depends(get_db)):
    rows = db.query(models.Agent).order_by(models.Agent.id).all()
    return [schemas.AgentOut.model_validate(r) for r in rows]


@router.get("/strategy-questions", response_model=list[schemas.StrategyQuestionOut])
def list_strategy_questions(
    status: str | None = Query(default=None, description="filter by status"),
    db: Session = Depends(get_db),
):
    q = db.query(models.StrategyQuestion)
    if status:
        q = q.filter(models.StrategyQuestion.status == status)
    rows = q.order_by(models.StrategyQuestion.asked.desc()).all()
    return [schemas.StrategyQuestionOut.model_validate(r) for r in rows]


@router.get("/strategy-questions/{question_id}", response_model=schemas.StrategyQuestionOut)
def get_strategy_question(question_id: str, db: Session = Depends(get_db)):
    row = db.get(models.StrategyQuestion, question_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="question_not_found")
    return schemas.StrategyQuestionOut.model_validate(row)
