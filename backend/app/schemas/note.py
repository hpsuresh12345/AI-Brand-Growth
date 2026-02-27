"""
Note schemas for request/response validation.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class NoteBase(BaseModel):
    """Base note schema."""
    content: str = Field(..., min_length=1, max_length=5000)
    is_important: bool = False


class NoteCreate(NoteBase):
    """Schema for creating a new note."""
    pass


class NoteUpdate(BaseModel):
    """Schema for updating a note."""
    content: str | None = Field(None, min_length=1, max_length=5000)
    is_important: bool | None = None


class NoteResponse(NoteBase):
    """Schema for note response."""
    id: int
    lead_id: int
    user_id: int | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class ActivityLogResponse(BaseModel):
    """Schema for activity log response."""
    id: int
    user_email: str | None
    action: str
    entity_type: str | None
    entity_id: int | None
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True
