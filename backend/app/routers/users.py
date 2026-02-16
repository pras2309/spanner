from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..middleware.auth import get_current_user
from ..middleware.rbac import require_permission
from ..schemas.user import UserCreate, UserUpdate, UserResponse
from ..services.user_service import UserService
from ..models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserResponse], dependencies=[Depends(require_permission("users:manage"))])
async def list_users(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await UserService.list_users(db, search)

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_permission("users:manage"))])
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await UserService.create_user(db, data, current_user.id)

@router.get("/{id}", response_model=UserResponse, dependencies=[Depends(require_permission("users:manage"))])
async def get_user(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await UserService.get_user(db, id)

@router.patch("/{id}", response_model=UserResponse, dependencies=[Depends(require_permission("users:manage"))])
async def update_user(
    id: UUID,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await UserService.update_user(db, id, data, current_user.id)
