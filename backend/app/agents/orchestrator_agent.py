"""
Orchestrator Agent for AI Brand Growth Copilot.

Coordinates a full growth cycle for a brand by wiring together
the strategy agent, content agent, engagement agent, decision
engine, and memory manager into a single cohesive pipeline.
"""

import logging
import random
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand_profile import BrandProfile
from app.agents.strategy_agent import generate_strategy
from app.agents.content_agent import generate_content
from app.agents.engagement_agent import evaluate_content
from app.core.decision_engine import evaluate as run_decision_engine
from app.core import memory_manager as memory

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────

CONTENT_BATCH_SIZE = 3          # posts to generate per cycle
ENGAGEMENT_THRESHOLD = 0.30     # decision engine threshold
SIMULATED_ENGAGEMENT = True     # toggle simulated metrics


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _brand_to_dict(brand: BrandProfile) -> dict[str, Any]:
    """Convert a BrandProfile ORM instance to a plain dict."""
    return {
        "name": brand.name,
        "niche": brand.niche,
        "target_audience": brand.target_audience,
        "tone": brand.tone,
        "expertise_areas": brand.expertise_areas or "",
        "growth_goal": brand.growth_goal or "",
    }


def _simulate_metrics() -> dict[str, int]:
    """Generate realistic simulated engagement metrics."""
    return {
        "likes": random.randint(5, 500),
        "comments": random.randint(0, 80),
        "shares": random.randint(0, 50),
    }


def _score_from_metrics(metrics: dict[str, int]) -> float:
    """Derive a 0–1 engagement score from raw metrics."""
    raw = (
        metrics.get("likes", 0) * 1
        + metrics.get("comments", 0) * 3
        + metrics.get("shares", 0) * 5
    )
    # Normalise against a reasonable ceiling
    return round(min(raw / 1000, 1.0), 3)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def run_growth_cycle(
    brand_id: int,
    db: AsyncSession,
) -> dict[str, Any]:
    """
    Execute a full growth cycle for a brand.

    Flow:
        1. Load brand profile
        2. Check existing strategy
        3. Generate strategy if none exists
        4. Generate a batch of content
        5. Simulate engagement analysis
        6. Run optimisation via decision engine
        7. Update strategy if needed
        8. Store agent memory
        9. Return structured executive summary

    Args:
        brand_id: ID of the brand to run the cycle for.
        db:       Async database session (injected).

    Returns:
        dict — structured executive summary of the cycle.
    """
    cycle_start = datetime.now(timezone.utc)
    errors: list[str] = []
    actions_taken: list[str] = []

    # ── 1. Load brand profile ─────────────────
    logger.info("═══ Growth cycle started for brand_id=%d ═══", brand_id)

    result = await db.execute(
        select(BrandProfile).where(BrandProfile.id == brand_id)
    )
    brand = result.scalar_one_or_none()

    if not brand:
        logger.error("Brand id=%d not found", brand_id)
        return {
            "success": False,
            "error": f"Brand with id={brand_id} not found.",
        }

    profile = _brand_to_dict(brand)
    actions_taken.append(f"Loaded brand profile: {brand.name}")
    logger.info("1/9  Brand loaded — %s [%s]", brand.name, brand.niche)

    # ── 2. Check existing strategy ────────────
    existing_strategy = await memory.get_strategy(db, brand_id)
    has_strategy = existing_strategy is not None
    logger.info("2/9  Existing strategy: %s", "found" if has_strategy else "none")

    # ── 3. Generate strategy if none ──────────
    strategy: dict[str, Any] = {}

    if has_strategy:
        strategy = existing_strategy
        actions_taken.append("Using existing strategy")
        logger.info("3/9  Re-using existing strategy")
    else:
        try:
            strategy = await generate_strategy(profile)
            await memory.save_strategy(
                db,
                brand_id,
                strategy.get("content_pillars", []),
                strategy.get("weekly_themes", []),
            )
            actions_taken.append("Generated new 30-day strategy")
            logger.info("3/9  New strategy generated and saved")
        except Exception as exc:
            msg = f"Strategy generation failed: {exc}"
            logger.error("3/9  %s", msg)
            errors.append(msg)

    # ── 4. Generate content batch ─────────────
    generated_content: list[dict[str, Any]] = []
    calendar = strategy.get("calendar", [])
    topics_to_generate = calendar[:CONTENT_BATCH_SIZE] if calendar else [
        {"platform": "LinkedIn", "topic": f"{brand.niche} insights"},
        {"platform": "Twitter/X", "topic": f"{brand.niche} quick tip"},
        {"platform": "Instagram", "topic": f"{brand.niche} behind the scenes"},
    ]

    for entry in topics_to_generate:
        platform = entry.get("platform", "LinkedIn")
        topic = entry.get("topic", "General post")
        try:
            content = await generate_content(profile, platform, topic)
            # Persist
            piece = await memory.store_content(
                db,
                brand_id=brand_id,
                platform=platform,
                topic=topic,
                content_text=content.get("body", ""),
            )
            content["db_id"] = piece.id
            generated_content.append(content)
        except Exception as exc:
            msg = f"Content generation failed ({platform}/{topic}): {exc}"
            logger.error("4/9  %s", msg)
            errors.append(msg)

    actions_taken.append(f"Generated {len(generated_content)} content pieces")
    logger.info("4/9  Content batch complete — %d pieces", len(generated_content))

    # ── 5. Simulate engagement analysis ───────
    engagement_results: list[dict[str, Any]] = []

    for content in generated_content:
        metrics = _simulate_metrics() if SIMULATED_ENGAGEMENT else {
            "likes": 0, "comments": 0, "shares": 0,
        }
        score = _score_from_metrics(metrics)
        content_id = content.get("db_id")

        # Update score in DB
        if content_id:
            await memory.update_engagement(db, content_id, score)

        try:
            evaluation = await evaluate_content(
                content.get("body", ""),
                metrics,
            )
            engagement_results.append({
                "content_id": content_id,
                "metrics": metrics,
                "engagement_score": score,
                "evaluation": evaluation,
            })
        except Exception as exc:
            msg = f"Engagement evaluation failed: {exc}"
            logger.error("5/9  %s", msg)
            errors.append(msg)
            engagement_results.append({
                "content_id": content_id,
                "metrics": metrics,
                "engagement_score": score,
                "evaluation": None,
            })

    actions_taken.append(f"Analysed engagement for {len(engagement_results)} pieces")
    logger.info("5/9  Engagement analysis complete")

    # ── 6. Run decision engine ────────────────
    content_scores = await memory.get_engagement_scores(db, brand_id)
    weekly_scores = await memory.get_weekly_averages(db, brand_id)

    decisions = run_decision_engine(
        content_scores=content_scores,
        weekly_scores=weekly_scores if len(weekly_scores) >= 2 else None,
        engagement_threshold=ENGAGEMENT_THRESHOLD,
    )

    actions_taken.append(
        f"Decision engine returned {len(decisions['actions'])} action(s)"
    )
    logger.info(
        "6/9  Decision engine — %d actions, needs_attention=%s",
        len(decisions["actions"]),
        decisions["needs_attention"],
    )

    # ── 7. Update strategy if needed ──────────
    strategy_updated = False

    if decisions["needs_attention"] and strategy:
        try:
            # Re-generate strategy with updated context
            refreshed = await generate_strategy(profile)
            await memory.save_strategy(
                db,
                brand_id,
                refreshed.get("content_pillars", []),
                refreshed.get("weekly_themes", []),
            )
            strategy_updated = True
            actions_taken.append("Strategy refreshed based on decision engine")
            logger.info("7/9  Strategy refreshed")
        except Exception as exc:
            msg = f"Strategy refresh failed: {exc}"
            logger.error("7/9  %s", msg)
            errors.append(msg)
    else:
        logger.info("7/9  Strategy refresh not needed")

    # ── 8. Store agent memory ─────────────────
    cycle_summary_data = {
        "brand_id": brand_id,
        "brand_name": brand.name,
        "content_generated": len(generated_content),
        "avg_engagement": round(
            sum(e["engagement_score"] for e in engagement_results)
            / max(len(engagement_results), 1),
            3,
        ),
        "decisions_count": len(decisions["actions"]),
        "strategy_updated": strategy_updated,
        "errors_count": len(errors),
        "timestamp": cycle_start.isoformat(),
    }

    await memory.store_memory(
        db,
        context_type="growth_cycle",
        content=cycle_summary_data,
    )
    actions_taken.append("Cycle memory stored")
    logger.info("8/9  Cycle memory persisted")

    # ── 9. Executive summary ──────────────────
    cycle_end = datetime.now(timezone.utc)
    duration = (cycle_end - cycle_start).total_seconds()

    summary = {
        "success": len(errors) == 0,
        "brand": {
            "id": brand_id,
            "name": brand.name,
            "niche": brand.niche,
        },
        "strategy": {
            "existed": has_strategy,
            "refreshed": strategy_updated,
            "pillars": [
                p.get("name", p) if isinstance(p, dict) else p
                for p in strategy.get("content_pillars", [])
            ],
        },
        "content": {
            "generated": len(generated_content),
            "platforms": list({
                c.get("content_type", "unknown") for c in generated_content
            }),
        },
        "engagement": {
            "avg_score": cycle_summary_data["avg_engagement"],
            "pieces_analysed": len(engagement_results),
        },
        "decisions": {
            "actions_count": len(decisions["actions"]),
            "needs_attention": decisions["needs_attention"],
            "action_types": decisions["summary"],
        },
        "actions_taken": actions_taken,
        "errors": errors,
        "duration_seconds": round(duration, 2),
        "timestamp": cycle_start.isoformat(),
    }

    logger.info(
        "9/9  ═══ Growth cycle complete — %d pieces, %.1fs, %d errors ═══",
        len(generated_content), duration, len(errors),
    )

    return summary
