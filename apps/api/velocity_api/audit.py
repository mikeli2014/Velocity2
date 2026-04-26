"""Shared audit-log emission helper.

Lifted out of ``routes/inbox.py`` once we had >1 writer that needed to
log to the audit table (routing rules + projects + decisions + sources).
The helper appends a row to ``models.AuditEvent`` using the request's
session — caller commits, so the audit row is atomic with whatever
triggered it.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from . import models, schemas


def now_label() -> str:
    """Human-readable timestamp matching the existing seed shape
    (``2026-04-26 14:32``). Audit log + last_hit columns both use this
    format."""
    return datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M")


def emit_audit(
    db: Session,
    *,
    category: str,
    severity: str,
    action: str,
    target: str | None,
    scope: str | None = None,
    actor: str = "system",
    link: dict[str, Any] | None = None,
) -> models.AuditEvent:
    """Append a single ``AuditEvent`` row.

    The caller is responsible for ``db.commit()`` — we share the request
    session so the audit write is atomic with whatever triggered it.
    """
    row = models.AuditEvent(
        id=schemas.make_id("au"),
        at=now_label(),
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
