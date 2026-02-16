from sqlalchemy import select, func, desc, or_
from typing import Any, Optional
import base64
from uuid import UUID

def apply_cursor_pagination(
    query: Any,
    column: Any,
    limit: int = 20,
    cursor: Optional[UUID] = None
):
    if cursor:
        query = query.where(column > cursor)

    return query.order_by(column).limit(limit)
