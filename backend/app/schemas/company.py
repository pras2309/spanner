from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from enum import Enum

class CompanyStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class SegmentBrief(BaseModel):
    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)

class CompanyCreate(BaseModel):
    name: str
    website: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    linkedin_url: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_country: Optional[str] = None
    address_zip: Optional[str] = None
    founded_year: Optional[int] = None
    revenue_range: Optional[str] = None
    employee_size_range: Optional[str] = None
    segment_id: UUID

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    linkedin_url: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_country: Optional[str] = None
    address_zip: Optional[str] = None
    founded_year: Optional[int] = None
    revenue_range: Optional[str] = None
    employee_size_range: Optional[str] = None
    segment_id: Optional[UUID] = None

class CompanyResponse(CompanyCreate):
    id: UUID
    status: CompanyStatus
    rejection_reason: Optional[str] = None
    is_duplicate: bool
    is_active: bool
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    segment: Optional[SegmentBrief] = None

    model_config = ConfigDict(from_attributes=True)

class CompanyBrief(BaseModel):
    id: UUID
    name: str
    segment_name: Optional[str] = None
    status: CompanyStatus

    model_config = ConfigDict(from_attributes=True)

class RejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=1)
