from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.audit import AuditLogResponse
from ..models.audit import AuditLog
from ..models.user import User
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])

@router.get("", response_model=List[AuditLogResponse], dependencies=[Depends(require_permission("audit:read_global"))])
async def get_all_audit_logs(
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(AuditLog).options(selectinload(AuditLog.actor)).order_by(desc(AuditLog.created_at)).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/entity/{type}/{id}", response_model=List[AuditLogResponse])
async def get_entity_timeline(
    type: str,
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(AuditLog).where(
        (AuditLog.entity_type == type) & (AuditLog.entity_id == id)
    ).options(selectinload(AuditLog.actor)).order_by(desc(AuditLog.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()
