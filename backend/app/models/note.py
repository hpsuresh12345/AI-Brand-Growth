"""
Note model for lead comments and notes.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Note(Base):
    """SQLAlchemy model for lead notes."""

    __tablename__ = "notes"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── References ───────────────────────────────
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # ── Content ──────────────────────────────────
    content = Column(Text, nullable=False)
    is_important = Column(Boolean, default=False, nullable=False)
    
    # ── Metadata ─────────────────────────────────
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime,
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Note(id={self.id}, lead_id={self.lead_id}, user_id={self.user_id})>"
