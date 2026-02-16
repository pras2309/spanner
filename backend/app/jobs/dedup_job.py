from ..database import AsyncSessionLocal
from ..services.dedup_service import DedupService

async def run_dedup_job():
    async with AsyncSessionLocal() as db:
        print("Starting dedup job...")
        results = await DedupService.run_dedup_job(db)
        print(f"Dedup job finished: {results}")
