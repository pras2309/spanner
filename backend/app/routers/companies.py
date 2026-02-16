from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, RejectRequest
from ..services.company_service import CompanyService
from ..models.user import User

router = APIRouter(prefix="/companies", tags=["companies"])

@router.get("", response_model=List[CompanyResponse], dependencies=[Depends(require_permission("companies:read"))])
async def list_companies(
    segment_id: Optional[UUID] = None,
    status: Optional[str] = None,
    created_by: Optional[UUID] = None,
    is_duplicate: bool = False,
    is_active: bool = True,
    search: Optional[str] = None,
    limit: int = Query(20, le=100),
    cursor: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CompanyService.list_companies(
        db, segment_id, status, created_by, is_duplicate, is_active, search, limit, cursor
    )

@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("companies:create"))])
async def create_company(
    data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CompanyService.create_company(db, data, current_user.id)

@router.get("/{id}", response_model=CompanyResponse, dependencies=[Depends(require_permission("companies:read"))])
async def get_company(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CompanyService.get_company(db, id)

@router.patch("/{id}", response_model=CompanyResponse, dependencies=[Depends(require_permission("companies:edit"))])
async def update_company(
    id: UUID,
    data: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CompanyService.update_company(db, id, data, current_user.id)

@router.post("/{id}/approve", response_model=CompanyResponse, dependencies=[Depends(require_permission("companies:approve"))])
async def approve_company(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CompanyService.approve_company(db, id, current_user.id)

@router.post("/{id}/reject", response_model=CompanyResponse, dependencies=[Depends(require_permission("companies:reject"))])
async def reject_company(
    id: UUID,
    data: RejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CompanyService.reject_company(db, id, data, current_user.id)
