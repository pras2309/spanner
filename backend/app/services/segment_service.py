from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status

from ..models.segment import Segment, Offering
from ..schemas.segment import SegmentCreate, SegmentUpdate, OfferingCreate
from .audit_service import AuditService

class SegmentService:
    @staticmethod
    async def create_segment(db: AsyncSession, data: SegmentCreate, user_id: UUID) -> Segment:
        # Check if name exists
        stmt = select(Segment).where(Segment.name == data.name)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Segment with name '{data.name}' already exists"
            )

        segment = Segment(
            name=data.name,
            description=data.description,
            status="active",
            created_by=user_id
        )

        # Handle existing offerings
        if data.offering_ids:
            stmt = select(Offering).where(Offering.id.in_(data.offering_ids))
            result = await db.execute(stmt)
            segment.offerings.extend(result.scalars().all())

        # Handle new offerings
        if data.new_offerings:
            for off_data in data.new_offerings:
                # Check if offering name already exists globally
                stmt = select(Offering).where(Offering.name == off_data.name)
                result = await db.execute(stmt)
                existing_off = result.scalar_one_or_none()
                if existing_off:
                    if existing_off not in segment.offerings:
                        segment.offerings.append(existing_off)
                else:
                    new_off = Offering(name=off_data.name, description=off_data.description)
                    segment.offerings.append(new_off)

        db.add(segment)
        await db.flush()

        await AuditService.log_event(
            db, user_id, "create", "segment", segment.id,
            {"name": segment.name, "description": segment.description}
        )

        await db.commit()
        await db.refresh(segment)
        return segment

    @staticmethod
    async def update_segment(db: AsyncSession, segment_id: UUID, data: SegmentUpdate, user_id: UUID) -> Segment:
        stmt = select(Segment).where(Segment.id == segment_id)
        result = await db.execute(stmt)
        segment = result.scalar_one_or_none()
        if not segment:
            raise HTTPException(status_code=404, detail="Segment not found")

        if data.name:
            # Check uniqueness if name changed
            if data.name != segment.name:
                stmt = select(Segment).where(Segment.name == data.name)
                res = await db.execute(stmt)
                if res.scalar_one_or_none():
                    raise HTTPException(status_code=409, detail=f"Name '{data.name}' taken")
            segment.name = data.name

        if data.description is not None:
            segment.description = data.description

        if data.offering_ids is not None:
            stmt = select(Offering).where(Offering.id.in_(data.offering_ids))
            res = await db.execute(stmt)
            segment.offerings = res.scalars().all()

        if data.new_offerings:
            for off_data in data.new_offerings:
                stmt = select(Offering).where(Offering.name == off_data.name)
                res = await db.execute(stmt)
                existing_off = res.scalar_one_or_none()
                if existing_off:
                    if existing_off not in segment.offerings:
                        segment.offerings.append(existing_off)
                else:
                    new_off = Offering(name=off_data.name, description=off_data.description)
                    segment.offerings.append(new_off)

        await AuditService.log_event(
            db, user_id, "update", "segment", segment.id,
            {"data": data.model_dump(exclude_unset=True)}
        )

        await db.commit()
        await db.refresh(segment)
        return segment

    @staticmethod
    async def archive_segment(db: AsyncSession, segment_id: UUID, user_id: UUID) -> Segment:
        stmt = select(Segment).where(Segment.id == segment_id)
        result = await db.execute(stmt)
        segment = result.scalar_one_or_none()
        if not segment:
            raise HTTPException(status_code=404, detail="Segment not found")

        segment.status = "archived"
        await AuditService.log_event(db, user_id, "archive", "segment", segment.id)
        await db.commit()
        await db.refresh(segment)
        return segment

    @staticmethod
    async def activate_segment(db: AsyncSession, segment_id: UUID, user_id: UUID) -> Segment:
        stmt = select(Segment).where(Segment.id == segment_id)
        result = await db.execute(stmt)
        segment = result.scalar_one_or_none()
        if not segment:
            raise HTTPException(status_code=404, detail="Segment not found")

        segment.status = "active"
        await AuditService.log_event(db, user_id, "activate", "segment", segment.id)
        await db.commit()
        await db.refresh(segment)
        return segment

    @staticmethod
    async def list_segments(
        db: AsyncSession,
        status: Optional[str] = "active",
        search: Optional[str] = None,
        limit: int = 20,
        cursor: Optional[UUID] = None
    ) -> List[Segment]:
        from ..utils.pagination import apply_cursor_pagination

        stmt = select(Segment)

        if status:
            stmt = stmt.where(Segment.status == status)

        if search:
            stmt = stmt.where(or_(
                Segment.name.ilike(f"%{search}%"),
                Segment.description.ilike(f"%{search}%")
            ))

        stmt = apply_cursor_pagination(stmt, Segment.id, limit, cursor)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_segment(db: AsyncSession, segment_id: UUID) -> Segment:
        # Load with offerings
        from sqlalchemy.orm import selectinload
        stmt = select(Segment).where(Segment.id == segment_id).options(selectinload(Segment.offerings))
        result = await db.execute(stmt)
        segment = result.scalar_one_or_none()
        if not segment:
            raise HTTPException(status_code=404, detail="Segment not found")
        return segment
