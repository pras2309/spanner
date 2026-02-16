from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status

from ..models.user import User, Role
from ..schemas.user import UserCreate, UserUpdate
from ..utils.security import get_password_hash
from .audit_service import AuditService

class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, data: UserCreate, admin_id: UUID) -> User:
        # Check if email exists
        stmt = select(User).where(User.email == data.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(
            email=data.email,
            name=data.name,
            password_hash=get_password_hash(data.password),
            is_active=True
        )

        # Assign roles
        if data.role_ids:
            stmt = select(Role).where(Role.id.in_(data.role_ids))
            result = await db.execute(stmt)
            user.roles.extend(result.scalars().all())

        db.add(user)
        await db.flush()

        await AuditService.log_event(db, admin_id, "create", "user", user.id, {"email": user.email})
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user(db: AsyncSession, user_id: UUID, data: UserUpdate, admin_id: UUID) -> User:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if data.name: user.name = data.name
        if data.is_active is not None: user.is_active = data.is_active

        if data.role_ids is not None:
            # Clear and re-assign
            user.roles = []
            stmt = select(Role).where(Role.id.in_(data.role_ids))
            result = await db.execute(stmt)
            user.roles.extend(result.scalars().all())

        await AuditService.log_event(db, admin_id, "update", "user", user.id)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def list_users(db: AsyncSession, search: Optional[str] = None) -> List[User]:
        from sqlalchemy.orm import selectinload
        stmt = select(User).options(selectinload(User.roles))
        if search:
            stmt = stmt.where(or_(User.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_user(db: AsyncSession, user_id: UUID) -> User:
        from sqlalchemy.orm import selectinload
        stmt = select(User).where(User.id == user_id).options(selectinload(User.roles))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user: raise HTTPException(404, "User not found")
        return user
