from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.collateral import CollateralCreate, CollateralUpdate, CollateralResponse
from ..services.collateral_service import CollateralService
from ..models.user import User

router = APIRouter(prefix="/collaterals", tags=["collaterals"])

@router.get("", response_model=List[CollateralResponse], dependencies=[Depends(require_permission("collaterals:manage"))])
async def list_collaterals(
    scope_type: Optional[str] = None,
    scope_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CollateralService.list(db, scope_type, scope_id)

@router.post("", response_model=CollateralResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("collaterals:manage"))])
async def create_collateral(
    data: CollateralCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CollateralService.create(db, data, current_user.id)

@router.delete("/{id}", dependencies=[Depends(require_permission("collaterals:manage"))])
async def delete_collateral(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CollateralService.delete(db, id, current_user.id)
