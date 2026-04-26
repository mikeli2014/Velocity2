"""Project CRUD.

Promoted out of ``catalog.py`` once writes arrived. Mirrors the
``objectives.py`` shape: full CRUD with audit emissions on every
mutation.

Audit shape
-----------

- create → ``project`` category, ``info`` severity, action ``新增项目``
- update → ``project``, ``info``, action ``更新项目``
- delete → ``project``, ``warning``, action ``删除项目``

Each row's ``link`` carries ``{page: "okr", projectId}`` so the audit
table can deep-link back to the project.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..audit import emit_audit
from ..auth import current_user
from ..db import get_db

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("", response_model=list[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    rows = db.query(models.Project).order_by(models.Project.id).all()
    return [schemas.ProjectOut.model_validate(r) for r in rows]


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    row = db.get(models.Project, project_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project_not_found")
    return schemas.ProjectOut.model_validate(row)


@router.post("", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    actor: str = Depends(current_user),
):
    project_id = payload.id or schemas.make_id("proj")
    if db.get(models.Project, project_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="project_id_taken")

    data = payload.model_dump(by_alias=False)
    data["id"] = project_id

    row = models.Project(**data)
    db.add(row)
    emit_audit(
        db,
        category="project",
        severity="info",
        action="新增项目",
        target=payload.name,
        scope=payload.dept_id,
        actor=actor,
        link={"page": "okr", "projectId": project_id},
    )
    db.commit()
    db.refresh(row)
    return schemas.ProjectOut.model_validate(row)


@router.patch("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: str,
    payload: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    actor: str = Depends(current_user),
):
    row = db.get(models.Project, project_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project_not_found")

    for field, value in payload.model_dump(exclude_unset=True, by_alias=False).items():
        setattr(row, field, value)

    emit_audit(
        db,
        category="project",
        severity="info",
        action="更新项目",
        target=row.name,
        scope=row.dept_id,
        actor=actor,
        link={"page": "okr", "projectId": project_id},
    )
    db.commit()
    db.refresh(row)
    return schemas.ProjectOut.model_validate(row)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    actor: str = Depends(current_user),
):
    row = db.get(models.Project, project_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="project_not_found")
    name = row.name
    dept_id = row.dept_id
    db.delete(row)
    emit_audit(
        db,
        category="project",
        severity="warning",
        action="删除项目",
        target=name,
        scope=dept_id,
        actor=actor,
    )
    db.commit()
    return None
