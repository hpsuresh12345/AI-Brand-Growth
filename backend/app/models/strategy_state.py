"""
StrategyState model for AI Brand Growth Copilot.

Persists the current strategic state for a brand — content pillars,
weekly plan, and last-updated timestamp — so agents can pick up
where they left off across sessions.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, Text, DateTime, ForeignKey,
)

from app.database import Base


class StrategyState(Base):
    """SQLAlchemy model for brand strategy state."""

    __tablename__ = "strategy_states"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── Foreign Key ──────────────────────────────
    brand_id = Column(
        Integer,
        ForeignKey("brand_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,
        doc="One-to-one reference to the brand profile",
    )

    # ── Strategy Data ────────────────────────────
    content_pillars = Column(
        Text,
        nullable=True,
        doc="JSON-encoded list of content pillars",
    )
    weekly_plan = Column(
        Text,
        nullable=True,
        doc="JSON-encoded weekly content plan",
    )

    # ── Metadata ─────────────────────────────────
    last_updated = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        doc="Timestamp of the last strategy update (UTC)",
    )

    def __repr__(self) -> str:
        return (
            f"<StrategyState(id={self.id}, brand_id={self.brand_id}, "
            f"last_updated='{self.last_updated}')>"
        )
