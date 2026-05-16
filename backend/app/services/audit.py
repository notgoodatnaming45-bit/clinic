"""
Audit Service — HIPAA-Required Immutable Audit Logging
Every patient record view, edit, export, and auth event must be logged.
"""
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import AuditLog, AuditAction


async def log_audit_event(
    db: AsyncSession,
    user_id: Optional[uuid.UUID],
    action: AuditAction,
    resource_type: Optional[str] = None,
    resource_id: Optional[uuid.UUID] = None,
    ip: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[dict] = None,
) -> None:
    """
    Write an immutable audit log entry.
    Called on every sensitive operation in the system.
    """
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip,
        user_agent=user_agent,
        details=details or {},
    )
    db.add(log)
    # Note: session commit handled by the request lifecycle in get_db()