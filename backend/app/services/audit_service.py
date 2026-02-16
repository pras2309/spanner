from sqlalchemy.ext.asyncio import AsyncSession
from ..models import AuditLog
import uuid
from typing import Any, Optional

class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        actor_id: Optional[uuid.UUID],
        action: str,
        entity_type: str,
        entity_id: Optional[uuid.UUID],
        details: Optional[dict] = None
    ):
        audit_entry = AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details
        )
        db.add(audit_entry)
        await db.flush()
        return audit_entry
