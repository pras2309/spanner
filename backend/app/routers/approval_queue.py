from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.company import CompanyResponse
from ..schemas.contact import ContactResponse
from ..services.company_service import CompanyService
from ..services.contact_service import ContactService
from ..models.user import User

router = APIRouter(prefix="/approval-queue", tags=["approval-queue"])

@router.get("/companies", response_model=List[CompanyResponse], dependencies=[Depends(require_permission("companies:approve"))])
async def get_approval_queue_companies(
    segment_id: Optional[UUID] = None,
    created_by: Optional[UUID] = None,
    limit: int = Query(20, le=100),
    cursor: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CompanyService.list_companies(
        db, segment_id=segment_id, status="pending", created_by=created_by, limit=limit, cursor=cursor
    )

@router.get("/contacts", response_model=List[ContactResponse], dependencies=[Depends(require_permission("contacts:approve"))])
async def get_approval_queue_contacts(
    segment_id: Optional[UUID] = None,
    company_id: Optional[UUID] = None,
    created_by: Optional[UUID] = None,
    limit: int = Query(20, le=100),
    cursor: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.list_contacts(
        db, segment_id=segment_id, company_id=company_id, status="uploaded", created_by=created_by, limit=limit, cursor=cursor
    )
