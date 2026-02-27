"""
BrandProfile model for AI Brand Growth Copilot.

Represents a brand's identity, voice, audience,
and growth objectives — the foundation that all agents reference.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime

from app.database import Base


class BrandProfile(Base):
    """SQLAlchemy model for brand profiles."""

    __tablename__ = "brand_profiles"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── Brand Identity ───────────────────────────
    name = Column(
        String(150),
        nullable=False,
        index=True,
        doc="Brand or business display name",
    )
    niche = Column(
        String(100),
        nullable=False,
        doc="Industry niche, e.g. 'SaaS', 'E-commerce', 'Health & Wellness'",
    )
    target_audience = Column(
        Text,
        nullable=False,
        doc="Description of ideal customers / audience segments",
    )

    # ── Voice & Expertise ────────────────────────
    tone = Column(
        String(100),
        nullable=False,
        doc="Brand voice, e.g. 'Professional', 'Friendly & casual', 'Bold'",
    )
    expertise_areas = Column(
        Text,
        nullable=True,
        doc="Comma-separated or JSON list of expertise areas",
    )

    # ── Growth ───────────────────────────────────
    growth_goal = Column(
        Text,
        nullable=True,
        doc="Primary growth objective, e.g. '10k followers in 90 days'",
    )

    # ── Metadata ─────────────────────────────────
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        doc="Timestamp when the profile was created (UTC)",
    )

    def __repr__(self) -> str:
        return (
            f"<BrandProfile(id={self.id}, name='{self.name}', "
            f"niche='{self.niche}')>"
        )
