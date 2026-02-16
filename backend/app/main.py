from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .routers import health, auth, segments, assignments, companies, approval_queue, contacts, uploads, users, collaterals, workbench, exports, audit_logs
from .jobs.scheduler import setup_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_scheduler()
    yield
    # Shutdown

app = FastAPI(title="Spanner API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(segments.router, prefix="/api")
app.include_router(assignments.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(approval_queue.router, prefix="/api")
app.include_router(contacts.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(collaterals.router, prefix="/api")
app.include_router(workbench.router, prefix="/api")
app.include_router(exports.router, prefix="/api")
app.include_router(audit_logs.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Spanner API is running"}
