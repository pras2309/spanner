from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from enum import Enum

class SegmentStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class OfferingCreate(BaseModel):
    name: str
    description: Optional[str] = None

class OfferingResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class SegmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    offering_ids: Optional[List[UUID]] = []
    new_offerings: Optional[List[OfferingCreate]] = []

class SegmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    offering_ids: Optional[List[UUID]] = None
    new_offerings: Optional[List[OfferingCreate]] = None

class UserBrief(BaseModel):
    id: UUID
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)

class SegmentResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    status: SegmentStatus
    offerings: List[OfferingResponse]
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
