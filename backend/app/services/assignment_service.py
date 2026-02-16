from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status

from ..models.assignment import Assignment
from ..models.user import User
from ..schemas.assignment import AssignmentCreate
from .audit_service import AuditService

class AssignmentService:
    @staticmethod
    async def create_assignment(db: AsyncSession, data: AssignmentCreate, user_id: UUID) -> Assignment:
        # Check if assignee exists and has correct role (simplified for now)
        stmt = select(User).where(User.id == data.assigned_to)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Assignee not found")

        # Check unique constraint
        stmt = select(Assignment).where(and_(
            Assignment.entity_type == data.entity_type,
            Assignment.entity_id == data.entity_id,
            Assignment.assigned_to == data.assigned_to,
            Assignment.is_active == True
        ))
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Assignment already exists")

        assignment = Assignment(
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            assigned_to=data.assigned_to,
            assigned_by=user_id,
            is_active=True
        )

        db.add(assignment)
        await db.flush()

        await AuditService.log_event(
            db, user_id, "assign", data.entity_type, data.entity_id,
            {"assigned_to": str(data.assigned_to)}
        )

        await db.commit()
        await db.refresh(assignment)

        # Fetch with related users
        from sqlalchemy.orm import selectinload
        stmt = select(Assignment).where(Assignment.id == assignment.id).options(
            selectinload(Assignment.assignee),
            selectinload(Assignment.assigner)
        )
        result = await db.execute(stmt)
        return result.scalar_one()

    @staticmethod
    async def list_assignments(
        db: AsyncSession,
        entity_type: Optional[str] = None,
        entity_id: Optional[UUID] = None,
        assigned_to: Optional[UUID] = None
    ) -> List[Assignment]:
        from sqlalchemy.orm import selectinload
        stmt = select(Assignment).where(Assignment.is_active == True).options(
            selectinload(Assignment.assignee),
            selectinload(Assignment.assigner)
        )

        if entity_type:
            stmt = stmt.where(Assignment.entity_type == entity_type)
        if entity_id:
            stmt = stmt.where(Assignment.entity_id == entity_id)
        if assigned_to:
            stmt = stmt.where(Assignment.assigned_to == assigned_to)

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def delete_assignment(db: AsyncSession, assignment_id: UUID, user_id: UUID):
        stmt = select(Assignment).where(Assignment.id == assignment_id)
        result = await db.execute(stmt)
        assignment = result.scalar_one_or_none()
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")

        assignment.is_active = False
        await AuditService.log_event(
            db, user_id, "unassign", assignment.entity_type, assignment.entity_id,
            {"unassigned_user": str(assignment.assigned_to)}
        )
        await db.commit()
        return {"message": "Assignment removed"}
