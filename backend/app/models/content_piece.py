"""
ContentPiece model for AI Brand Growth Copilot.

Represents a single piece of generated or tracked content
linked to a brand, with platform, topic, and engagement data.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey,
)

from app.database import Base


class ContentPiece(Base):
    """SQLAlchemy model for content pieces."""

    __tablename__ = "content_pieces"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── Foreign Key ──────────────────────────────
    brand_id = Column(
        Integer,
        ForeignKey("brand_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Reference to the owning brand profile",
    )

    # ── Content Details ──────────────────────────
    platform = Column(
        String(50),
        nullable=False,
        doc="Target platform, e.g. 'LinkedIn', 'Twitter/X', 'Instagram'",
    )
    topic = Column(
        String(200),
        nullable=False,
        doc="Content topic or headline",
    )
    content_text = Column(
        Text,
        nullable=False,
        doc="Full content body / copy",
    )

    # ── Performance ──────────────────────────────
    engagement_score = Column(
        Float,
        nullable=True,
        default=0.0,
        doc="Normalised engagement score (0.0 – 1.0)",
    )

    # ── Metadata ─────────────────────────────────
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        doc="Timestamp when the content was created (UTC)",
    )

    def __repr__(self) -> str:
        return (
            f"<ContentPiece(id={self.id}, brand_id={self.brand_id}, "
            f"platform='{self.platform}', topic='{self.topic}')>"
        )
