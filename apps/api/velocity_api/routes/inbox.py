"""Inbox-shaped resources: ingest queue, notifications, routing rules,
audit log. All but routing rules are append-mostly with small mutations
(state transitions, mark-as-read).
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db

router = APIRouter(prefix="/api/v1", tags=["inbox"])


def _now_label() -> str:
    """Produce a human-readable timestamp matching the existing seed
    shape (``2026-04-26 14:32``). Audit log + last_hit columns both use
    this format so the frontend's table renders consistently."""
    return datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M")


def _emit_audit(
    db: Session,
    *,
    category: str,
    severity: str,
    action: str,
    target: str | None,
    scope: str | None = None,
    actor: str = "system",
    link: dict | None = None,
) -> models.AuditEvent:
    """Append a single AuditEvent row. Caller is responsible for
    committing — we share the request's session so the write is atomic
    with whatever triggered it.
    """
    row = models.AuditEvent(
        id=schemas.make_id("au"),
        at=_now_label(),
        actor=actor,
        ip="127.0.0.1",  # no real auth yet; placeholder so the col is non-null
        category=category,
        severity=severity,
        action=action,
        target=target,
        scope=scope,
        link=link,
    )
    db.add(row)
    return row


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


@router.post(
    "/routing-rules",
    response_model=schemas.RoutingRuleOut,
    status_code=status.HTTP_201_CREATED,
)
def create_routing_rule(payload: schemas.RoutingRuleCreate, db: Session = Depends(get_db)):
    rule_id = payload.id or schemas.make_id("rt")
    if db.get(models.RoutingRule, rule_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="routing_rule_id_taken")

    row = models.RoutingRule(
        id=rule_id,
        priority=payload.priority or "medium",
        enabled=payload.enabled,
        intent=payload.intent,
        target_dept=payload.target_dept,
        target_skill=payload.target_skill,
        permission=payload.permission,
        note=payload.note,
        hits=0,
        last_hit="—",
    )
    db.add(row)
    _emit_audit(
        db,
        category="routing",
        severity="info",
        action="新增路由规则",
        target=payload.intent,
        scope=payload.target_dept,
        link={"page": "assistants", "ruleId": rule_id},
    )
    db.commit()
    db.refresh(row)
    return schemas.RoutingRuleOut.model_validate(row)


@router.patch("/routing-rules/{rule_id}", response_model=schemas.RoutingRuleOut)
def update_routing_rule(
    rule_id: str,
    payload: schemas.RoutingRuleUpdate,
    db: Session = Depends(get_db),
):
    row = db.get(models.RoutingRule, rule_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="routing_rule_not_found")

    data = payload.model_dump(exclude_unset=True, by_alias=False)
    # Distinguish a pure enable/disable toggle from a substantive edit so
    # the audit log reads naturally.
    pure_toggle = set(data.keys()) == {"enabled"}
    prior_enabled = row.enabled

    for field, value in data.items():
        setattr(row, field, value)

    if pure_toggle:
        action = "启用路由规则" if data["enabled"] else "停用路由规则"
        severity = "info" if data["enabled"] == prior_enabled else "info"
    else:
        action = "更新路由规则"
        severity = "info"

    _emit_audit(
        db,
        category="routing",
        severity=severity,
        action=action,
        target=row.intent,
        scope=row.target_dept,
        link={"page": "assistants", "ruleId": row.id},
    )
    db.commit()
    db.refresh(row)
    return schemas.RoutingRuleOut.model_validate(row)


@router.delete("/routing-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_routing_rule(rule_id: str, db: Session = Depends(get_db)):
    row = db.get(models.RoutingRule, rule_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="routing_rule_not_found")
    intent = row.intent
    target_dept = row.target_dept
    db.delete(row)
    _emit_audit(
        db,
        category="routing",
        severity="warning",
        action="删除路由规则",
        target=intent,
        scope=target_dept,
        # No deep-link target after delete — keep the link slot null.
    )
    db.commit()
    return None


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
