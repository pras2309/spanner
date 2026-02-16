from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.contact import ContactCreate, ContactUpdate, ContactResponse, BulkApproveRequest, AssignSDRRequest
from ..services.contact_service import ContactService
from ..models.user import User

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.get("", response_model=List[ContactResponse], dependencies=[Depends(require_permission("contacts:read"))])
async def list_contacts(
    company_id: Optional[UUID] = None,
    segment_id: Optional[UUID] = None,
    status: Optional[str] = None,
    assigned_sdr_id: Optional[UUID] = None,
    created_by: Optional[UUID] = None,
    is_duplicate: bool = False,
    is_active: bool = True,
    search: Optional[str] = None,
    limit: int = Query(20, le=100),
    cursor: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.list_contacts(
        db, company_id, segment_id, status, assigned_sdr_id, created_by, is_duplicate, is_active, search, limit, cursor
    )

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("contacts:create"))])
async def create_contact(
    data: ContactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.create_contact(db, data, current_user.id)

@router.get("/{id}", response_model=ContactResponse, dependencies=[Depends(require_permission("contacts:read"))])
async def get_contact(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.get_contact(db, id)

@router.patch("/{id}", response_model=ContactResponse, dependencies=[Depends(require_permission("contacts:edit"))])
async def update_contact(
    id: UUID,
    data: ContactUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.update_contact(db, id, data, current_user.id)

@router.post("/approve", dependencies=[Depends(require_permission("contacts:approve"))])
async def bulk_approve_contacts(
    data: BulkApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.bulk_approve(db, data, current_user.id)

@router.post("/{id}/assign", response_model=ContactResponse, dependencies=[Depends(require_permission("contacts:assign"))])
async def assign_sdr(
    id: UUID,
    data: AssignSDRRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.assign_sdr(db, id, data, current_user.id)

@router.post("/{id}/schedule-meeting", response_model=ContactResponse, dependencies=[Depends(require_permission("contacts:schedule_meeting"))])
async def schedule_meeting(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ContactService.schedule_meeting(db, id, current_user.id)
