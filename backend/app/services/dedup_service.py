from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from .audit_service import AuditService

class DedupService:
    @staticmethod
    async def run_dedup_job(db: AsyncSession):
        # Company dedup: name + website within same segment
        # Using raw SQL for efficient window functions if supported, or subqueries
        # This is a simplified version for Agent D

        # Mark duplicates for companies
        company_sql = text("""
            UPDATE companies
            SET is_duplicate = true
            WHERE id IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER(
                        PARTITION BY LOWER(TRIM(name)), COALESCE(LOWER(TRIM(website)), ''), segment_id
                        ORDER BY created_at ASC
                    ) as rn
                    FROM companies
                    WHERE is_active = true
                ) t WHERE t.rn > 1
            )
        """)

        # Mark duplicates for contacts
        contact_sql = text("""
            UPDATE contacts
            SET is_duplicate = true
            WHERE id IN (
                SELECT id FROM (
                    SELECT id, ROW_NUMBER() OVER(
                        PARTITION BY LOWER(TRIM(email)), company_id
                        ORDER BY created_at ASC
                    ) as rn
                    FROM contacts
                    WHERE is_active = true
                ) t WHERE t.rn > 1
            )
        """)

        c_res = await db.execute(company_sql)
        ct_res = await db.execute(contact_sql)

        await AuditService.log_event(db, None, "dedup_job", "system", None, {
            "companies_flagged": c_res.rowcount,
            "contacts_flagged": ct_res.rowcount
        })

        await db.commit()
        return {"companies": c_res.rowcount, "contacts": ct_res.rowcount}
