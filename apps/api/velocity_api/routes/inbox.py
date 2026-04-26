"""Inbox-shaped resources: ingest queue, notifications, routing rules,
audit log. All but routing rules are append-mostly with small mutations
(state transitions, mark-as-read).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1", tags=["inbox"])


# --- Ingest Queue -------------------------------------------------------


@router.get("/ingest-queue", response_model=list[schemas.IngestQueueItemOut])
def list_ingest(
    state: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(models.IngestQueueItem)
    if state:
        q = q.filter(models.IngestQueueItem.state == state)
    rows = q.order_by(models.IngestQueueItem.id).all()
    return [schemas.IngestQueueItemOut.model_validate(r) for r in rows]


@router.post("/ingest-queue", response_model=schemas.IngestQueueItemOut, status_code=status.HTTP_201_CREATED)
def create_ingest_item(payload: schemas.IngestQueueCreate, db: Session = Depends(get_db)):
    item = models.IngestQueueItem(
        id=schemas.make_id("iq"),
        name=payload.name,
        type=payload.type,
        size=payload.size,
        state=payload.state,
        progress=payload.progress,
        scope=payload.scope,
        owner=payload.owner,
        uploaded="刚刚",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return schemas.IngestQueueItemOut.model_validate(item)


@router.patch("/ingest-queue/{item_id}", response_model=schemas.IngestQueueItemOut)
def patch_ingest_item(item_id: str, payload: schemas.IngestQueuePatch, db: Session = Depends(get_db)):
    row = db.get(models.IngestQueueItem, item_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ingest_item_not_found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return schemas.IngestQueueItemOut.model_validate(row)


# --- Notifications ------------------------------------------------------


@router.get("/notifications", response_model=list[schemas.NotificationOut])
def list_notifications(
    unread_only: bool = Query(default=False, alias="unreadOnly"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Notification)
    if unread_only:
        q = q.filter(models.Notification.read.is_(False))
    rows = q.order_by(models.Notification.id).all()
    return [schemas.NotificationOut.model_validate(r) for r in rows]


@router.post("/notifications/{notif_id}/read", response_model=schemas.NotificationOut)
def mark_notification_read(notif_id: str, db: Session = Depends(get_db)):
    row = db.get(models.Notification, notif_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="notification_not_found")
    row.read = True
    db.commit()
    db.refresh(row)
    return schemas.NotificationOut.model_validate(row)


@router.post("/notifications/mark-all-read", response_model=list[schemas.NotificationOut])
def mark_all_notifications_read(db: Session = Depends(get_db)):
    rows = db.query(models.Notification).filter(models.Notification.read.is_(False)).all()
    for r in rows:
        r.read = True
    db.commit()
    after = db.query(models.Notification).order_by(models.Notification.id).all()
    return [schemas.NotificationOut.model_validate(r) for r in after]


# --- Routing rules ------------------------------------------------------


@router.get("/routing-rules", response_model=list[schemas.RoutingRuleOut])
def list_routing_rules(db: Session = Depends(get_db)):
    rows = db.query(models.RoutingRule).order_by(models.RoutingRule.id).all()
    return [schemas.RoutingRuleOut.model_validate(r) for r in rows]


# --- Audit log ----------------------------------------------------------


@router.get("/audit-log", response_model=list[schemas.AuditEventOut])
def list_audit(
    category: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    q = db.query(models.AuditEvent)
    if category:
        q = q.filter(models.AuditEvent.category == category)
    if severity:
        q = q.filter(models.AuditEvent.severity == severity)
    rows = q.order_by(models.AuditEvent.at.desc()).limit(limit).all()
    return [schemas.AuditEventOut.model_validate(r) for r in rows]
