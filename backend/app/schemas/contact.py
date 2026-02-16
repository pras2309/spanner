from pydantic import BaseModel, ConfigDict, Field, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from enum import Enum
from .segment import UserBrief

class ContactStatus(str, Enum):
    UPLOADED = "uploaded"
    APPROVED = "approved"
    ASSIGNED_TO_SDR = "assigned_to_sdr"
    MEETING_SCHEDULED = "meeting_scheduled"

class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    company_id: UUID
    mobile_phone: Optional[str] = None
    job_title: Optional[str] = None
    direct_phone: Optional[str] = None
    email_2: Optional[str] = None
    email_active_status: Optional[str] = None
    lead_source: Optional[str] = None
    management_level: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_country: Optional[str] = None
    address_zip: Optional[str] = None
    primary_timezone: Optional[str] = None
    linkedin_url: Optional[str] = None
    linkedin_summary: Optional[str] = None
    data_requester_details: Optional[str] = None

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    company_id: Optional[UUID] = None
    mobile_phone: Optional[str] = None
    job_title: Optional[str] = None
    direct_phone: Optional[str] = None
    email_2: Optional[str] = None
    email_active_status: Optional[str] = None
    lead_source: Optional[str] = None
    management_level: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_country: Optional[str] = None
    address_zip: Optional[str] = None
    primary_timezone: Optional[str] = None
    linkedin_url: Optional[str] = None
    linkedin_summary: Optional[str] = None
    data_requester_details: Optional[str] = None

class ContactResponse(ContactCreate):
    id: UUID
    segment_id: UUID
    segment_name: Optional[str] = None
    company_name: Optional[str] = None
    status: ContactStatus
    assigned_sdr_id: Optional[UUID] = None
    assigned_sdr: Optional[UserBrief] = None
    is_duplicate: bool
    is_active: bool
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BulkApproveRequest(BaseModel):
    contact_ids: List[UUID] = Field(..., min_length=1)

class AssignSDRRequest(BaseModel):
    sdr_id: UUID
