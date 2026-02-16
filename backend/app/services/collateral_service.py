from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException

from ..models.collateral import MarketingCollateral
from ..schemas.collateral import CollateralCreate, CollateralUpdate
from .audit_service import AuditService

class CollateralService:
    @staticmethod
    async def create(db: AsyncSession, data: CollateralCreate, user_id: UUID) -> MarketingCollateral:
        collateral = MarketingCollateral(
            title=data.title,
            url=data.url,
            scope_type=data.scope_type,
            scope_id=data.scope_id,
            created_by=user_id
        )
        db.add(collateral)
        await db.flush()
        await AuditService.log_event(db, user_id, "create", "collateral", collateral.id)
        await db.commit()
        await db.refresh(collateral)
        return collateral

    @staticmethod
    async def list(db: AsyncSession, scope_type: Optional[str] = None, scope_id: Optional[UUID] = None) -> List[MarketingCollateral]:
        stmt = select(MarketingCollateral)
        if scope_type: stmt = stmt.where(MarketingCollateral.scope_type == scope_type)
        if scope_id: stmt = stmt.where(MarketingCollateral.scope_id == scope_id)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def delete(db: AsyncSession, collateral_id: UUID, user_id: UUID):
        stmt = select(MarketingCollateral).where(MarketingCollateral.id == collateral_id)
        result = await db.execute(stmt)
        collateral = result.scalar_one_or_none()
        if not collateral: raise HTTPException(404, "Collateral not found")
        await db.delete(collateral)
        await AuditService.log_event(db, user_id, "delete", "collateral", collateral_id)
        await db.commit()
