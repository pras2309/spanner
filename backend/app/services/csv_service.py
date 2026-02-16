import csv
import io
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from uuid import UUID, uuid4
from fastapi import HTTPException, UploadFile
from typing import List, Dict

from ..models.upload import UploadBatch, UploadError
from ..models.segment import Segment
from ..models.company import Company
from ..models.contact import Contact
from ..utils.csv_validators import COMPANY_REQUIRED_COLUMNS, CONTACT_REQUIRED_COLUMNS, is_valid_email, is_valid_url, validate_founded_year
from ..utils.normalizers import normalize_company_name, normalize_url
from .audit_service import AuditService

class CSVService:
    @staticmethod
    async def validate_and_import(file: UploadFile, entity_type: str, uploader_id: UUID, db: AsyncSession):
        content = await file.read()
        try:
            decoded = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=422, detail="File must be UTF-8 encoded")

        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=422, detail="File size exceeds 10MB limit")

        reader = csv.DictReader(io.StringIO(decoded))
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        headers_lower = {h.lower(): h for h in headers}

        required = COMPANY_REQUIRED_COLUMNS if entity_type == "company" else CONTACT_REQUIRED_COLUMNS
        missing = [col for col in required if col.lower() not in headers_lower]

        if missing:
            raise HTTPException(status_code=422, detail=f"Missing required columns: {', '.join(missing)}")

        batch = UploadBatch(
            id=uuid4(),
            entity_type=entity_type,
            file_name=file.filename,
            file_size_bytes=len(content),
            status="processing",
            uploader_id=uploader_id,
            total_rows=0,
            valid_rows=0,
            invalid_rows=0
        )
        db.add(batch)
        await db.flush()

        valid_objects = []
        errors = []

        row_num = 1
        for row in reader:
            row_num += 1
            row_errors = []

            # Map headers back to actual row keys
            mapped_row = {}
            for k, v in row.items():
                if k and k.strip():
                    mapped_row[k.strip().lower()] = v.strip() if v else ""

            # Entity-specific validation
            if entity_type == "company":
                obj, row_errs = await CSVService._validate_company_row(mapped_row, row_num, uploader_id, batch.id, db)
            else:
                obj, row_errs = await CSVService._validate_contact_row(mapped_row, row_num, uploader_id, batch.id, db)

            if row_errs:
                errors.extend(row_errs)
            else:
                valid_objects.append(obj)

            batch.total_rows += 1

        # Bulk insert valid rows
        if valid_objects:
            db.add_all(valid_objects)
            batch.valid_rows = len(valid_objects)

        # Store errors
        if errors:
            db.add_all([UploadError(**e, batch_id=batch.id) for e in errors])
            batch.invalid_rows = len(errors)

        batch.status = "completed"
        await AuditService.log_event(db, uploader_id, "upload", entity_type, batch.id, {"valid": batch.valid_rows, "invalid": batch.invalid_rows})
        await db.commit()

        return batch

    @staticmethod
    async def _validate_company_row(row: Dict, row_num: int, user_id: UUID, batch_id: UUID, db: AsyncSession):
        errors = []
        name = row.get("company name")
        seg_name = row.get("segment name")

        if not name: errors.append({"row_number": row_num, "column_name": "Company Name", "error_message": "Required", "value": ""})
        if not seg_name: errors.append({"row_number": row_num, "column_name": "Segment Name", "error_message": "Required", "value": ""})

        website = row.get("company website")
        if website and not is_valid_url(website):
            errors.append({"row_number": row_num, "column_name": "Company Website", "error_message": "Invalid URL", "value": website})

        year = row.get("founded year")
        if year and not validate_founded_year(year):
            errors.append({"row_number": row_num, "column_name": "Founded Year", "error_message": "Invalid year (1800-2024)", "value": year})

        segment_id = None
        if seg_name:
            stmt = select(Segment).where(and_(Segment.name == seg_name, Segment.status == "active"))
            res = await db.execute(stmt)
            seg = res.scalar_one_or_none()
            if not seg:
                errors.append({"row_number": row_num, "column_name": "Segment Name", "error_message": f"Active segment '{seg_name}' not found", "value": seg_name})
            else:
                segment_id = seg.id

        if errors: return None, errors

        return Company(
            name=normalize_company_name(name),
            website=normalize_url(website) if website else None,
            segment_id=segment_id,
            status="pending",
            created_by=user_id,
            batch_id=batch_id,
            is_active=True,
            is_duplicate=False,
            # ... map other fields from row ...
            industry=row.get("company industry"),
            description=row.get("company description")
        ), []

    @staticmethod
    async def _validate_contact_row(row: Dict, row_num: int, user_id: UUID, batch_id: UUID, db: AsyncSession):
        errors = []
        fname = row.get("first name")
        lname = row.get("last name")
        email = row.get("email")
        cname = row.get("company name")

        if not fname: errors.append({"row_number": row_num, "column_name": "First Name", "error_message": "Required", "value": ""})
        if not lname: errors.append({"row_number": row_num, "column_name": "Last Name", "error_message": "Required", "value": ""})
        if not email: errors.append({"row_number": row_num, "column_name": "Email", "error_message": "Required", "value": ""})
        elif not is_valid_email(email): errors.append({"row_number": row_num, "column_name": "Email", "error_message": "Invalid email format", "value": email})

        if not cname: errors.append({"row_number": row_num, "column_name": "Company Name", "error_message": "Required", "value": ""})

        company = None
        if cname:
            stmt = select(Company).where(and_(Company.name == cname, Company.status == "approved"))
            res = await db.execute(stmt)
            company = res.scalar_one_or_none()
            if not company:
                errors.append({"row_number": row_num, "column_name": "Company Name", "error_message": f"Approved company '{cname}' not found", "value": cname})

        if errors: return None, errors

        return Contact(
            first_name=fname,
            last_name=lname,
            email=email.lower(),
            company_id=company.id,
            segment_id=company.segment_id,
            status="uploaded",
            created_by=user_id,
            batch_id=batch_id,
            is_active=True,
            is_duplicate=False,
            job_title=row.get("job title")
        ), []
