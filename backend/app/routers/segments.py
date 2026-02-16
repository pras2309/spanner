from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.segment import SegmentCreate, SegmentUpdate, SegmentResponse
from ..services.segment_service import SegmentService
from ..models.user import User

router = APIRouter(prefix="/segments", tags=["segments"])

@router.get("", response_model=List[SegmentResponse], dependencies=[Depends(require_permission("segments:read"))])
async def list_segments(
    status: Optional[str] = "active",
    search: Optional[str] = None,
    limit: int = Query(20, le=100),
    cursor: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await SegmentService.list_segments(db, status, search, limit, cursor)

@router.post("", response_model=SegmentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("segments:create"))])
async def create_segment(
    data: SegmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await SegmentService.create_segment(db, data, current_user.id)

@router.get("/{id}", response_model=SegmentResponse, dependencies=[Depends(require_permission("segments:read"))])
async def get_segment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await SegmentService.get_segment(db, id)

@router.patch("/{id}", response_model=SegmentResponse, dependencies=[Depends(require_permission("segments:create"))])
async def update_segment(
    id: UUID,
    data: SegmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await SegmentService.update_segment(db, id, data, current_user.id)

@router.post("/{id}/archive", response_model=SegmentResponse, dependencies=[Depends(require_permission("segments:archive"))])
async def archive_segment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await SegmentService.archive_segment(db, id, current_user.id)

@router.post("/{id}/activate", response_model=SegmentResponse, dependencies=[Depends(require_permission("segments:archive"))])
async def activate_segment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await SegmentService.activate_segment(db, id, current_user.id)
