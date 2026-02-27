"""
AgentMemory model for AI Brand Growth Copilot.

General-purpose memory store for AI agents — persists
contextual knowledge, observations, and decisions
across sessions so agents can learn and recall.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime

from app.database import Base


class AgentMemory(Base):
    """SQLAlchemy model for agent memory entries."""

    __tablename__ = "agent_memories"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── Memory Context ───────────────────────────
    context_type = Column(
        String(50),
        nullable=False,
        index=True,
        doc="Memory category, e.g. 'brand_insight', 'audience_feedback', 'decision'",
    )
    content = Column(
        Text,
        nullable=False,
        doc="The memory payload — plain text or JSON",
    )

    # ── Metadata ─────────────────────────────────
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        doc="Timestamp when the memory was stored (UTC)",
    )

    def __repr__(self) -> str:
        return (
            f"<AgentMemory(id={self.id}, "
            f"context_type='{self.context_type}')>"
        )
