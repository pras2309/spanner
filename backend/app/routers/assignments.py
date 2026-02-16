from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.assignment import AssignmentCreate, AssignmentResponse
from ..services.assignment_service import AssignmentService
from ..models.user import User

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("assignments:create"))])
async def create_assignment(
    data: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AssignmentService.create_assignment(db, data, current_user.id)

@router.get("", response_model=List[AssignmentResponse])
async def list_assignments(
    entity_type: Optional[str] = None,
    entity_id: Optional[UUID] = None,
    assigned_to: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AssignmentService.list_assignments(db, entity_type, entity_id, assigned_to)

@router.delete("/{id}", dependencies=[Depends(require_permission("assignments:create"))])
async def delete_assignment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await AssignmentService.delete_assignment(db, id, current_user.id)
