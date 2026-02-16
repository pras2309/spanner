from pydantic import BaseModel, ConfigDict, HttpUrl
from uuid import UUID
from datetime import datetime
from typing import Optional

class CollateralCreate(BaseModel):
    title: str
    url: str
    scope_type: str # segment, offering, lead
    scope_id: UUID

class CollateralUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    scope_type: Optional[str] = None
    scope_id: Optional[UUID] = None

class CollateralResponse(BaseModel):
    id: UUID
    title: str
    url: str
    scope_type: str
    scope_id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
