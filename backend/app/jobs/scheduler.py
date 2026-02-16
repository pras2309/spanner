from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from .dedup_job import run_dedup_job

scheduler = AsyncIOScheduler()

def setup_scheduler():
    # Run every Sunday at 2 AM
    scheduler.add_job(
        run_dedup_job,
        CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="dedup_job",
        replace_existing=True
    )
    scheduler.start()
