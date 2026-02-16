from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status

from ..models.company import Company
from ..models.segment import Segment
from ..schemas.company import CompanyCreate, CompanyUpdate, RejectRequest
from .audit_service import AuditService
from ..utils.normalizers import normalize_company_name, normalize_url

class CompanyService:
    @staticmethod
    async def create_company(db: AsyncSession, data: CompanyCreate, user_id: UUID) -> Company:
        # Validate segment
        stmt = select(Segment).where(and_(Segment.id == data.segment_id, Segment.status == "active"))
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Active segment not found")

        # Normalize
        name = normalize_company_name(data.name)
        website = normalize_url(data.website) if data.website else None

        company = Company(
            name=name,
            website=website,
            phone=data.phone.strip() if data.phone else None,
            description=data.description.strip() if data.description else None,
            linkedin_url=normalize_url(data.linkedin_url) if data.linkedin_url else None,
            industry=data.industry.strip() if data.industry else None,
            sub_industry=data.sub_industry.strip() if data.sub_industry else None,
            address_street=data.address_street.strip() if data.address_street else None,
            address_city=data.address_city.strip() if data.address_city else None,
            address_state=data.address_state.strip() if data.address_state else None,
            address_country=data.address_country.strip() if data.address_country else None,
            address_zip=data.address_zip.strip() if data.address_zip else None,
            founded_year=data.founded_year,
            revenue_range=data.revenue_range,
            employee_size_range=data.employee_size_range,
            segment_id=data.segment_id,
            status="pending",
            created_by=user_id,
            is_active=True,
            is_duplicate=False
        )

        db.add(company)
        await db.flush()

        await AuditService.log_event(db, user_id, "create", "company", company.id)

        await db.commit()
        await db.refresh(company)
        return company

    @staticmethod
    async def update_company(db: AsyncSession, company_id: UUID, data: CompanyUpdate, user_id: UUID) -> Company:
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        old_values = {}
        for field, value in data.model_dump(exclude_unset=True).items():
            old_values[field] = getattr(company, field)
            if field == 'name' and value:
                setattr(company, field, normalize_company_name(value))
            elif field in ['website', 'linkedin_url'] and value:
                setattr(company, field, normalize_url(value))
            elif isinstance(value, str):
                setattr(company, field, value.strip())
            else:
                setattr(company, field, value)

        await AuditService.log_event(
            db, user_id, "update", "company", company.id,
            {"old": old_values, "new": data.model_dump(exclude_unset=True)}
        )

        await db.commit()
        await db.refresh(company)
        return company

    @staticmethod
    async def approve_company(db: AsyncSession, company_id: UUID, user_id: UUID) -> Company:
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        if company.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending companies can be approved")

        company.status = "approved"
        await AuditService.log_event(db, user_id, "approve", "company", company.id)
        await db.commit()
        await db.refresh(company)
        return company

    @staticmethod
    async def reject_company(db: AsyncSession, company_id: UUID, data: RejectRequest, user_id: UUID) -> Company:
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        if company.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending companies can be rejected")

        company.status = "rejected"
        company.rejection_reason = data.rejection_reason
        await AuditService.log_event(db, user_id, "reject", "company", company.id, {"reason": data.rejection_reason})
        await db.commit()
        await db.refresh(company)
        return company

    @staticmethod
    async def list_companies(
        db: AsyncSession,
        segment_id: Optional[UUID] = None,
        status: Optional[str] = None,
        created_by: Optional[UUID] = None,
        is_duplicate: bool = False,
        is_active: bool = True,
        search: Optional[str] = None,
        limit: int = 20,
        cursor: Optional[UUID] = None
    ) -> List[Company]:
        from ..utils.pagination import apply_cursor_pagination
        from sqlalchemy.orm import selectinload

        stmt = select(Company).options(selectinload(Company.segment))

        stmt = stmt.where(Company.is_active == is_active)
        stmt = stmt.where(Company.is_duplicate == is_duplicate)

        if segment_id:
            stmt = stmt.where(Company.segment_id == segment_id)
        if status:
            stmt = stmt.where(Company.status == status)
        if created_by:
            stmt = stmt.where(Company.created_by == created_by)

        if search:
            stmt = stmt.where(or_(
                Company.name.ilike(f"%{search}%"),
                Company.industry.ilike(f"%{search}%")
            ))

        stmt = stmt.order_by(desc(Company.created_at))
        stmt = apply_cursor_pagination(stmt, Company.id, limit, cursor)

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_company(db: AsyncSession, company_id: UUID) -> Company:
        from sqlalchemy.orm import selectinload
        stmt = select(Company).where(Company.id == company_id).options(selectinload(Company.segment))
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company
