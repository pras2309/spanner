from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..schemas.segment import SegmentResponse
from ..schemas.company import CompanyResponse
from ..schemas.upload import BatchResponse
from ..services.segment_service import SegmentService
from ..services.company_service import CompanyService
from ..models.user import User
from ..models.assignment import Assignment
from ..models.upload import UploadBatch
from sqlalchemy import select, and_

router = APIRouter(prefix="/workbench", tags=["workbench"])

@router.get("/segments", response_model=List[SegmentResponse])
async def get_my_segments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find segments assigned to this user
    stmt = select(Assignment).where(and_(
        Assignment.assigned_to == current_user.id,
        Assignment.entity_type == "segment",
        Assignment.is_active == True
    ))
    res = await db.execute(stmt)
    segment_ids = [a.entity_id for a in res.scalars().all()]

    if not segment_ids: return []

    # Use service to fetch detailed segment objects
    segments = []
    for sid in segment_ids:
        try:
            seg = await SegmentService.get_segment(db, sid)
            segments.append(seg)
        except: continue
    return segments

@router.get("/my-uploads", response_model=List[BatchResponse])
async def get_my_uploads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UploadBatch).where(UploadBatch.uploader_id == current_user.id).order_by(UploadBatch.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
