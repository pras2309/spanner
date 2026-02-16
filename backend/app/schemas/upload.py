from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from .segment import UserBrief

class UploadResponse(BaseModel):
    batch_id: UUID
    file_name: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    status: str

class BatchResponse(BaseModel):
    id: UUID
    entity_type: str
    file_name: str
    file_size_bytes: int
    total_rows: int
    valid_rows: int
    invalid_rows: int
    status: str
    uploader: Optional[UserBrief] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ErrorResponse(BaseModel):
    id: UUID
    row_number: int
    column_name: Optional[str] = None
    value: Optional[str] = None
    error_message: str
    is_corrected: bool

    model_config = ConfigDict(from_attributes=True)

class BatchListResponse(BaseModel):
    items: List[BatchResponse]
    total: int
