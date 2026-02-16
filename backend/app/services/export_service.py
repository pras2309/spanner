import csv
import io
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.responses import StreamingResponse
from typing import Any, List

from ..models.company import Company
from ..models.contact import Contact

class ExportService:
    @staticmethod
    async def export_companies(db: AsyncSession) -> StreamingResponse:
        stmt = select(Company)
        result = await db.execute(stmt)
        companies = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Name", "Website", "Status", "Industry", "Created At"])
        for c in companies:
            writer.writerow([str(c.id), c.name, c.website, c.status, c.industry, c.created_at.isoformat()])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=companies_export.csv"}
        )

    @staticmethod
    async def export_contacts(db: AsyncSession) -> StreamingResponse:
        stmt = select(Contact)
        result = await db.execute(stmt)
        contacts = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "First Name", "Last Name", "Email", "Status", "Created At"])
        for c in contacts:
            writer.writerow([str(c.id), c.first_name, c.last_name, c.email, c.status, c.created_at.isoformat()])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=contacts_export.csv"}
        )
