"""
Memory Manager for AI Brand Growth Copilot.

Centralised persistence layer that stores and retrieves:
  • Generated content pieces
  • Engagement metrics / scores
  • Strategy state updates
  • Agent memory entries
  • Historical performance data for trend analysis
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, update, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content_piece import ContentPiece
from app.models.strategy_state import StrategyState
from app.models.agent_memory import AgentMemory

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════
#  Content Storage
# ══════════════════════════════════════════════

async def store_content(
    db: AsyncSession,
    brand_id: int,
    platform: str,
    topic: str,
    content_text: str,
    engagement_score: float = 0.0,
) -> ContentPiece:
    """Persist a generated content piece."""
    piece = ContentPiece(
        brand_id=brand_id,
        platform=platform,
        topic=topic,
        content_text=content_text,
        engagement_score=engagement_score,
    )
    db.add(piece)
    await db.flush()
    logger.info("Stored content id=%d for brand=%d on %s", piece.id, brand_id, platform)
    return piece


async def get_content_by_brand(
    db: AsyncSession,
    brand_id: int,
    limit: int = 50,
) -> list[ContentPiece]:
    """Retrieve recent content for a brand, newest first."""
    result = await db.execute(
        select(ContentPiece)
        .where(ContentPiece.brand_id == brand_id)
        .order_by(desc(ContentPiece.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


# ══════════════════════════════════════════════
#  Engagement Data
# ══════════════════════════════════════════════

async def update_engagement(
    db: AsyncSession,
    content_id: int,
    engagement_score: float,
) -> None:
    """Update the engagement score for a content piece."""
    await db.execute(
        update(ContentPiece)
        .where(ContentPiece.id == content_id)
        .values(engagement_score=engagement_score)
    )
    await db.flush()
    logger.info("Updated engagement for content id=%d → %.3f", content_id, engagement_score)


async def get_engagement_scores(
    db: AsyncSession,
    brand_id: int,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """
    Return recent engagement scores for a brand's content,
    formatted for the decision engine.
    """
    result = await db.execute(
        select(
            ContentPiece.id,
            ContentPiece.topic,
            ContentPiece.platform,
            ContentPiece.engagement_score,
            ContentPiece.created_at,
        )
        .where(ContentPiece.brand_id == brand_id)
        .order_by(desc(ContentPiece.created_at))
        .limit(limit)
    )
    return [
        {
            "id": row.id,
            "topic": row.topic,
            "platform": row.platform,
            "engagement_score": row.engagement_score,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in result.all()
    ]


# ══════════════════════════════════════════════
#  Strategy State
# ══════════════════════════════════════════════

async def save_strategy(
    db: AsyncSession,
    brand_id: int,
    content_pillars: list[dict[str, Any]],
    weekly_plan: list[dict[str, Any]],
) -> StrategyState:
    """
    Upsert the strategy state for a brand.
    Creates a new row on first call, updates on subsequent calls.
    """
    result = await db.execute(
        select(StrategyState).where(StrategyState.brand_id == brand_id)
    )
    state = result.scalar_one_or_none()

    if state:
        state.content_pillars = json.dumps(content_pillars)
        state.weekly_plan = json.dumps(weekly_plan)
        state.last_updated = datetime.now(timezone.utc)
        logger.info("Updated strategy state for brand=%d", brand_id)
    else:
        state = StrategyState(
            brand_id=brand_id,
            content_pillars=json.dumps(content_pillars),
            weekly_plan=json.dumps(weekly_plan),
        )
        db.add(state)
        logger.info("Created strategy state for brand=%d", brand_id)

    await db.flush()
    return state


async def get_strategy(
    db: AsyncSession,
    brand_id: int,
) -> dict[str, Any] | None:
    """Retrieve the current strategy state for a brand, JSON-decoded."""
    result = await db.execute(
        select(StrategyState).where(StrategyState.brand_id == brand_id)
    )
    state = result.scalar_one_or_none()

    if not state:
        return None

    return {
        "id": state.id,
        "brand_id": state.brand_id,
        "content_pillars": json.loads(state.content_pillars) if state.content_pillars else [],
        "weekly_plan": json.loads(state.weekly_plan) if state.weekly_plan else [],
        "last_updated": state.last_updated.isoformat() if state.last_updated else None,
    }


# ══════════════════════════════════════════════
#  Agent Memory
# ══════════════════════════════════════════════

async def store_memory(
    db: AsyncSession,
    context_type: str,
    content: str | dict[str, Any],
) -> AgentMemory:
    """
    Persist an agent memory entry.
    Accepts plain text or a dict (auto-serialised to JSON).
    """
    text = json.dumps(content) if isinstance(content, dict) else content

    memory = AgentMemory(context_type=context_type, content=text)
    db.add(memory)
    await db.flush()
    logger.info("Stored memory id=%d type='%s'", memory.id, context_type)
    return memory


async def get_memories(
    db: AsyncSession,
    context_type: str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """
    Retrieve agent memories, optionally filtered by context_type.
    Returns newest first.
    """
    stmt = select(AgentMemory).order_by(desc(AgentMemory.created_at)).limit(limit)

    if context_type:
        stmt = stmt.where(AgentMemory.context_type == context_type)

    result = await db.execute(stmt)

    return [
        {
            "id": m.id,
            "context_type": m.context_type,
            "content": _try_parse_json(m.content),
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in result.scalars().all()
    ]


# ══════════════════════════════════════════════
#  Historical Performance
# ══════════════════════════════════════════════

async def get_weekly_averages(
    db: AsyncSession,
    brand_id: int,
    weeks: int = 4,
) -> list[float]:
    """
    Compute weekly average engagement scores for a brand.
    Returns a list of floats (oldest → newest), suitable
    for the decision engine's stagnation check.
    """
    result = await db.execute(
        select(
            func.strftime("%Y-%W", ContentPiece.created_at).label("week"),
            func.avg(ContentPiece.engagement_score).label("avg_score"),
        )
        .where(ContentPiece.brand_id == brand_id)
        .group_by("week")
        .order_by(desc("week"))
        .limit(weeks)
    )

    rows = result.all()
    # Reverse so oldest is first
    return [round(float(row.avg_score or 0), 4) for row in reversed(rows)]


async def get_pillar_averages(
    db: AsyncSession,
    brand_id: int,
    pillar_topics: dict[str, list[str]],
) -> dict[str, float]:
    """
    Compute average engagement per content pillar.

    Args:
        brand_id: The brand to query.
        pillar_topics: Mapping of pillar name → list of topic
            keywords that belong to that pillar.

    Returns:
        Dict of pillar name → avg engagement score.
    """
    all_content = await get_content_by_brand(db, brand_id, limit=200)

    pillar_scores: dict[str, list[float]] = {p: [] for p in pillar_topics}

    for piece in all_content:
        topic_lower = (piece.topic or "").lower()
        for pillar, keywords in pillar_topics.items():
            if any(kw.lower() in topic_lower for kw in keywords):
                pillar_scores[pillar].append(piece.engagement_score or 0)
                break

    return {
        pillar: round(sum(scores) / max(len(scores), 1), 4)
        for pillar, scores in pillar_scores.items()
    }


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _try_parse_json(text: str) -> Any:
    """Return parsed JSON if valid, otherwise the raw string."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return text
