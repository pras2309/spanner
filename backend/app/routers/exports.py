from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..middleware.rbac import require_permission
from ..services.export_service import ExportService

router = APIRouter(prefix="/exports", tags=["exports"])

@router.get("/companies", dependencies=[Depends(require_permission("exports:companies"))])
async def export_companies(db: AsyncSession = Depends(get_db)):
    return await ExportService.export_companies(db)

@router.get("/contacts", dependencies=[Depends(require_permission("exports:contacts"))])
async def export_contacts(db: AsyncSession = Depends(get_db)):
    return await ExportService.export_contacts(db)
