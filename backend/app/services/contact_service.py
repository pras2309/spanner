from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, update, desc
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException, status

from ..models.contact import Contact
from ..models.company import Company
from ..models.user import User
from ..schemas.contact import ContactCreate, ContactUpdate, BulkApproveRequest, AssignSDRRequest
from .audit_service import AuditService
from ..utils.normalizers import normalize_url

class ContactService:
    @staticmethod
    async def create_contact(db: AsyncSession, data: ContactCreate, user_id: UUID) -> Contact:
        # Validate company
        stmt = select(Company).where(Company.id == data.company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        if company.status != "approved":
            raise HTTPException(status_code=400, detail="Cannot create contact for unapproved company")

        contact = Contact(
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            email=data.email.strip().lower(),
            company_id=data.company_id,
            segment_id=company.segment_id, # Auto-set from company
            mobile_phone=data.mobile_phone.strip() if data.mobile_phone else None,
            job_title=data.job_title.strip() if data.job_title else None,
            direct_phone=data.direct_phone.strip() if data.direct_phone else None,
            email_2=data.email_2.strip().lower() if data.email_2 else None,
            email_active_status=data.email_active_status,
            lead_source=data.lead_source,
            management_level=data.management_level,
            address_street=data.address_street,
            address_city=data.address_city,
            address_state=data.address_state,
            address_country=data.address_country,
            address_zip=data.address_zip,
            primary_timezone=data.primary_timezone,
            linkedin_url=normalize_url(data.linkedin_url) if data.linkedin_url else None,
            linkedin_summary=data.linkedin_summary,
            data_requester_details=data.data_requester_details,
            status="uploaded",
            created_by=user_id,
            is_active=True,
            is_duplicate=False
        )

        db.add(contact)
        await db.flush()

        await AuditService.log_event(db, user_id, "create", "contact", contact.id)

        await db.commit()
        await db.refresh(contact)
        return contact

    @staticmethod
    async def update_contact(db: AsyncSession, contact_id: UUID, data: ContactUpdate, user_id: UUID) -> Contact:
        stmt = select(Contact).where(Contact.id == contact_id)
        result = await db.execute(stmt)
        contact = result.scalar_one_or_none()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        for field, value in data.model_dump(exclude_unset=True).items():
            if isinstance(value, str):
                value = value.strip()
                if field in ['email', 'email_2']:
                    value = value.lower()
                if field == 'linkedin_url' and value:
                    value = normalize_url(value)
            setattr(contact, field, value)

        await AuditService.log_event(db, user_id, "update", "contact", contact.id)
        await db.commit()
        await db.refresh(contact)
        return contact

    @staticmethod
    async def bulk_approve(db: AsyncSession, data: BulkApproveRequest, user_id: UUID):
        stmt = update(Contact).where(and_(
            Contact.id.in_(data.contact_ids),
            Contact.status == "uploaded"
        )).values(status="approved")

        result = await db.execute(stmt)
        count = result.rowcount

        await AuditService.log_event(
            db, user_id, "bulk_approve", "contact", None,
            {"count": count, "ids": [str(i) for i in data.contact_ids]}
        )
        await db.commit()
        return {"approved_count": count}

    @staticmethod
    async def assign_sdr(db: AsyncSession, contact_id: UUID, data: AssignSDRRequest, user_id: UUID) -> Contact:
        stmt = select(Contact).where(Contact.id == contact_id)
        result = await db.execute(stmt)
        contact = result.scalar_one_or_none()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        if contact.status != "approved":
            raise HTTPException(status_code=400, detail="Contact must be approved before assigning SDR")

        # Validate SDR user exists and has SDR role (simplified)
        stmt = select(User).where(User.id == data.sdr_id)
        result = await db.execute(stmt)
        sdr = result.scalar_one_or_none()
        if not sdr:
            raise HTTPException(status_code=404, detail="SDR not found")

        contact.assigned_sdr_id = data.sdr_id
        contact.status = "assigned_to_sdr"

        await AuditService.log_event(db, user_id, "assign_sdr", "contact", contact.id, {"sdr_id": str(data.sdr_id)})
        await db.commit()
        await db.refresh(contact)
        return contact

    @staticmethod
    async def schedule_meeting(db: AsyncSession, contact_id: UUID, user_id: UUID) -> Contact:
        stmt = select(Contact).where(Contact.id == contact_id)
        result = await db.execute(stmt)
        contact = result.scalar_one_or_none()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        if contact.status != "assigned_to_sdr":
            raise HTTPException(status_code=400, detail="Contact must be assigned to SDR to schedule meeting")

        contact.status = "meeting_scheduled"
        await AuditService.log_event(db, user_id, "schedule_meeting", "contact", contact.id)
        await db.commit()
        await db.refresh(contact)
        return contact

    @staticmethod
    async def list_contacts(
        db: AsyncSession,
        company_id: Optional[UUID] = None,
        segment_id: Optional[UUID] = None,
        status: Optional[str] = None,
        assigned_sdr_id: Optional[UUID] = None,
        created_by: Optional[UUID] = None,
        is_duplicate: bool = False,
        is_active: bool = True,
        search: Optional[str] = None,
        limit: int = 20,
        cursor: Optional[UUID] = None
    ) -> List[Contact]:
        from ..utils.pagination import apply_cursor_pagination
        from sqlalchemy.orm import selectinload

        stmt = select(Contact).options(
            selectinload(Contact.company),
            selectinload(Contact.segment),
            selectinload(Contact.assigned_sdr)
        )

        stmt = stmt.where(Contact.is_active == is_active)
        stmt = stmt.where(Contact.is_duplicate == is_duplicate)

        if company_id:
            stmt = stmt.where(Contact.company_id == company_id)
        if segment_id:
            stmt = stmt.where(Contact.segment_id == segment_id)
        if status:
            stmt = stmt.where(Contact.status == status)
        if assigned_sdr_id:
            stmt = stmt.where(Contact.assigned_sdr_id == assigned_sdr_id)
        if created_by:
            stmt = stmt.where(Contact.created_by == created_by)

        if search:
            stmt = stmt.where(or_(
                Contact.first_name.ilike(f"%{search}%"),
                Contact.last_name.ilike(f"%{search}%"),
                Contact.email.ilike(f"%{search}%")
            ))

        stmt = stmt.order_by(desc(Contact.created_at))
        stmt = apply_cursor_pagination(stmt, Contact.id, limit, cursor)

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_contact(db: AsyncSession, contact_id: UUID) -> Contact:
        from sqlalchemy.orm import selectinload
        stmt = select(Contact).where(Contact.id == contact_id).options(
            selectinload(Contact.company),
            selectinload(Contact.segment),
            selectinload(Contact.assigned_sdr)
        )
        result = await db.execute(stmt)
        contact = result.scalar_one_or_none()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        return contact
