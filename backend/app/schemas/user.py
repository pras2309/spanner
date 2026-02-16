from pydantic import BaseModel, ConfigDict, EmailStr
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class RoleBrief(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role_ids: List[int]

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    is_active: bool
    roles: List[RoleBrief]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserBrief(BaseModel):
    id: UUID
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)
