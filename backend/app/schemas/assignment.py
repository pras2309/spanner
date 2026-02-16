from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from .segment import UserBrief

class AssignmentCreate(BaseModel):
    entity_type: str
    entity_id: UUID
    assigned_to: UUID

class AssignmentResponse(BaseModel):
    id: UUID
    entity_type: str
    entity_id: UUID
    assigned_to: UserBrief
    assigned_by: UserBrief
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
