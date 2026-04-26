"""Header-based actor resolution stub.

Phase 2: read ``X-User-Id`` (a free-form display name like ``陈志远`` or
``ci``) from the incoming request and thread it into audit log writes
via the ``current_user`` dependency. This is intentionally NOT real
auth — Cloud Run still serves the API publicly. It just sets up the
seam so swapping in real OAuth / JWT later is a one-file change.

Usage:
    from .auth import current_user

    @router.post(...)
    def my_route(actor: str = Depends(current_user), db: Session = ...):
        emit_audit(db, ..., actor=actor)
"""

from __future__ import annotations

from fastapi import Header

# The default mirrors the demo's seed Company.tagline + asker fields —
# the CEO is the most plausible default actor when nothing else is set.
DEFAULT_ACTOR = "陈志远"


def current_user(x_user_id: str | None = Header(default=None, alias="X-User-Id")) -> str:
    """Return the actor for audit-log purposes.

    Trim whitespace; fall back to ``DEFAULT_ACTOR`` if absent or empty.
    Does NOT enforce membership — any string the client sends becomes
    the audit actor. That's fine for the demo and obvious in code.
    """
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()
    return DEFAULT_ACTOR
