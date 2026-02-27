"""
Activity log model for audit trail.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class ActivityLog(Base):
    """SQLAlchemy model for activity logs."""

    __tablename__ = "activity_logs"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── User Reference ───────────────────────────
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True)  # Denormalized for deleted users
    
    # ── Activity Details ─────────────────────────
    action = Column(
        String(50),
        nullable=False,
        index=True,
        doc="e.g. 'lead_created', 'lead_updated', 'user_login', 'lead_deleted'",
    )
    entity_type = Column(
        String(50),
        nullable=True,
        doc="e.g. 'lead', 'user', 'note'",
    )
    entity_id = Column(Integer, nullable=True, index=True)
    
    # ── Metadata ─────────────────────────────────
    description = Column(Text, nullable=True)
    meta_data = Column(JSON, nullable=True, doc="Additional context as JSON")
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # ── Timestamp ─────────────────────────────────
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    def __repr__(self) -> str:
        return (
            f"<ActivityLog(id={self.id}, action='{self.action}', "
            f"user_email='{self.user_email}', entity_type='{self.entity_type}')>"
        )
