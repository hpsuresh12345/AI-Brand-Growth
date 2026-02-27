"""
Lead model for AI Real Estate Lead Conversion Engine.

Represents a real estate prospect with contact details,
preferences, AI-generated scoring, and conversion metrics.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime

from app.database import Base


class Lead(Base):
    """SQLAlchemy model for real estate leads."""

    __tablename__ = "leads"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── Contact Information ──────────────────────
    name = Column(String(100), nullable=False, index=True)
    phone = Column(String(20), nullable=False)

    # ── Property Preferences ─────────────────────
    budget = Column(Integer, nullable=False, doc="Budget in local currency units")
    location = Column(String(200), nullable=False)
    timeline = Column(
        String(50),
        nullable=True,
        doc="e.g. 'Immediately', '1-3 months', '6+ months'",
    )
    property_type = Column(
        String(50),
        nullable=True,
        doc="e.g. '1BHK', '2BHK', 'Villa', 'Plot'",
    )

    # ── Financial Status ─────────────────────────
    loan_status = Column(
        String(50),
        nullable=True,
        doc="e.g. 'Pre-approved', 'Applied', 'Not started'",
    )

    # ── Lead Message ─────────────────────────────
    message = Column(Text, nullable=True, doc="Initial inquiry or notes from the lead")

    # ── AI-Generated Scoring ─────────────────────
    score = Column(
        Integer,
        nullable=True,
        default=0,
        doc="AI-assigned lead quality score (0-100)",
    )
    category = Column(
        String(20),
        nullable=True,
        default="new",
        doc="e.g. 'hot', 'warm', 'cold', 'new'",
    )
    conversion_probability = Column(
        Float,
        nullable=True,
        default=0.0,
        doc="AI-predicted conversion probability (0.0 - 1.0)",
    )
    no_show_risk = Column(
        Float,
        nullable=True,
        default=0.0,
        doc="AI-predicted risk of lead not showing up (0.0 - 1.0)",
    )

    # ── Metadata ─────────────────────────────────
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        doc="Timestamp when the lead was created (UTC)",
    )

    def __repr__(self) -> str:
        return (
            f"<Lead(id={self.id}, name='{self.name}', "
            f"score={self.score}, category='{self.category}')>"
        )
