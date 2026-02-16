from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.upload import BatchResponse, ErrorResponse, BatchListResponse
from ..services.csv_service import CSVService
from ..models.user import User
from ..models.upload import UploadBatch, UploadError
from sqlalchemy import select, func, desc

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/companies", response_model=BatchResponse, dependencies=[Depends(require_permission("companies:upload_csv"))])
async def upload_companies_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CSVService.validate_and_import(file, "company", current_user.id, db)

@router.post("/contacts", response_model=BatchResponse, dependencies=[Depends(require_permission("contacts:upload_csv"))])
async def upload_contacts_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CSVService.validate_and_import(file, "contact", current_user.id, db)

@router.get("/batches", response_model=List[BatchResponse], dependencies=[Depends(require_permission("uploads:read"))])
async def list_batches(
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UploadBatch).where(UploadBatch.uploader_id == current_user.id).order_by(desc(UploadBatch.created_at)).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/batches/{id}", response_model=BatchResponse, dependencies=[Depends(require_permission("uploads:read"))])
async def get_batch(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UploadBatch).where(UploadBatch.id == id)
    result = await db.execute(stmt)
    batch = result.scalar_one_or_none()
    if not batch: raise HTTPException(404, "Batch not found")
    return batch

@router.get("/batches/{id}/errors", response_model=List[ErrorResponse], dependencies=[Depends(require_permission("uploads:read"))])
async def get_batch_errors(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UploadError).where(UploadError.batch_id == id).order_by(UploadError.row_number)
    result = await db.execute(stmt)
    return result.scalars().all()
