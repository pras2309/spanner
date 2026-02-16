from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Any
from .user import UserBrief

class AuditLogResponse(BaseModel):
    id: UUID
    actor_id: Optional[UUID] = None
    actor: Optional[UserBrief] = None
    action: str
    entity_type: str
    entity_id: Optional[UUID] = None
    details: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
