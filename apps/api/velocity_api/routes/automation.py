"""Automation surface — Skill Packs, Workflows, Workflow Runs.

Phase 1 ships the read paths plus a single mutation: ``POST
/api/v1/workflow-runs`` so the frontend's RunDialog can persist a run
record after the simulated execution finishes. Skill/Workflow CRUD
beyond reads stays client-side until Phase 2 tooling needs them.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1", tags=["automation"])


# --- Skill Packs --------------------------------------------------------


@router.get("/skill-packs", response_model=list[schemas.SkillPackOut])
def list_skill_packs(
    dept: str | None = Query(default=None),
    scope: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(models.SkillPack)
    if dept:
        q = q.filter(models.SkillPack.dept == dept)
    if scope:
        q = q.filter(models.SkillPack.scope == scope)
    rows = q.order_by(models.SkillPack.id).all()
    return [schemas.SkillPackOut.model_validate(r) for r in rows]


@router.get("/skill-packs/{skill_id}", response_model=schemas.SkillPackOut)
def get_skill_pack(skill_id: str, db: Session = Depends(get_db)):
    row = db.get(models.SkillPack, skill_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="skill_not_found")
    return schemas.SkillPackOut.model_validate(row)


# --- Workflow templates -------------------------------------------------


@router.get("/workflows", response_model=list[schemas.WorkflowOut])
def list_workflows(
    dept_id: str | None = Query(default=None, alias="deptId"),
    status_q: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Workflow)
    if dept_id:
        q = q.filter(models.Workflow.dept_id == dept_id)
    if status_q:
        q = q.filter(models.Workflow.status == status_q)
    rows = q.order_by(models.Workflow.id).all()
    return [schemas.WorkflowOut.model_validate(r) for r in rows]


@router.get("/workflows/{workflow_id}", response_model=schemas.WorkflowOut)
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    row = db.get(models.Workflow, workflow_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="workflow_not_found")
    return schemas.WorkflowOut.model_validate(row)


# --- Workflow runs ------------------------------------------------------


@router.get("/workflow-runs", response_model=list[schemas.WorkflowRunOut])
def list_workflow_runs(
    workflow_id: str | None = Query(default=None, alias="workflowId"),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(models.WorkflowRun)
    if workflow_id:
        q = q.filter(models.WorkflowRun.workflow_id == workflow_id)
    rows = q.order_by(models.WorkflowRun.id.desc()).limit(limit).all()
    return [schemas.WorkflowRunOut.model_validate(r) for r in rows]


@router.post("/workflow-runs", response_model=schemas.WorkflowRunOut, status_code=status.HTTP_201_CREATED)
def create_workflow_run(payload: schemas.WorkflowRunCreate, db: Session = Depends(get_db)):
    if db.get(models.Workflow, payload.workflow_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="workflow_not_found")
    run = models.WorkflowRun(
        id=schemas.make_id("run"),
        workflow_id=payload.workflow_id,
        trigger=payload.trigger,
        actor=payload.actor,
        started=payload.started,
        duration=payload.duration,
        status=payload.status or "ok",
        output=payload.output,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return schemas.WorkflowRunOut.model_validate(run)
