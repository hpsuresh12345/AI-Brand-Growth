"""
Monitoring Agent for AI Brand Growth Copilot.

Runs periodic growth checks across all brands, detects
engagement decline, triggers corrective growth cycles,
and generates actionable alerts.
"""

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand_profile import BrandProfile
from app.core import memory_manager as memory
from app.agents.orchestrator_agent import run_growth_cycle

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────

MIN_WEEKS_FOR_COMPARISON = 2
DECLINE_THRESHOLD = 0.0     # any negative WoW change = decline
STAGNATION_THRESHOLD = 0.02 # < 2% growth = stagnation


# ──────────────────────────────────────────────
# Alert builder
# ──────────────────────────────────────────────

def _alert(
    level: str,
    brand_id: int,
    brand_name: str,
    title: str,
    detail: str,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a standardised alert dict."""
    return {
        "level": level,       # "critical" | "warning" | "info"
        "brand_id": brand_id,
        "brand_name": brand_name,
        "title": title,
        "detail": detail,
        "metadata": metadata or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ──────────────────────────────────────────────
# Single-brand check
# ──────────────────────────────────────────────

async def _check_brand(
    db: AsyncSession,
    brand: BrandProfile,
) -> dict[str, Any]:
    """
    Evaluate one brand's weekly engagement trend.

    Returns a per-brand result dict with trend data,
    any alerts generated, and whether a growth cycle was triggered.
    """
    brand_id = brand.id
    brand_name = brand.name
    alerts: list[dict[str, Any]] = []
    cycle_triggered = False
    cycle_result: dict[str, Any] | None = None

    # Fetch weekly averages (oldest → newest)
    weekly = await memory.get_weekly_averages(db, brand_id, weeks=4)

    if len(weekly) < MIN_WEEKS_FOR_COMPARISON:
        alerts.append(
            _alert(
                level="info",
                brand_id=brand_id,
                brand_name=brand_name,
                title="Insufficient data for trend analysis",
                detail=(
                    f"Only {len(weekly)} week(s) of data available; "
                    f"need at least {MIN_WEEKS_FOR_COMPARISON}."
                ),
            )
        )
        return {
            "brand_id": brand_id,
            "brand_name": brand_name,
            "weekly_scores": weekly,
            "growth_rate": None,
            "status": "insufficient_data",
            "alerts": alerts,
            "cycle_triggered": False,
            "cycle_result": None,
        }

    prev, curr = weekly[-2], weekly[-1]
    growth_rate = (curr - prev) / abs(prev) if prev != 0 else 0.0

    # ── Decline detected ──────────────────────
    if growth_rate < DECLINE_THRESHOLD:
        logger.warning(
            "Decline detected for '%s' — rate=%.2f%%",
            brand_name, growth_rate * 100,
        )

        alerts.append(
            _alert(
                level="critical",
                brand_id=brand_id,
                brand_name=brand_name,
                title="Engagement decline detected",
                detail=(
                    f"Week-over-week engagement dropped {growth_rate:+.1%} "
                    f"(from {prev:.3f} to {curr:.3f}). "
                    f"Triggering automatic growth cycle."
                ),
                metadata={
                    "previous_week": prev,
                    "current_week": curr,
                    "growth_rate": round(growth_rate, 4),
                },
            )
        )

        # Trigger corrective growth cycle
        try:
            cycle_result = await run_growth_cycle(brand_id, db)
            cycle_triggered = True
            logger.info("Corrective growth cycle completed for '%s'", brand_name)
        except Exception as exc:
            logger.error("Growth cycle failed for '%s': %s", brand_name, exc)
            alerts.append(
                _alert(
                    level="critical",
                    brand_id=brand_id,
                    brand_name=brand_name,
                    title="Corrective growth cycle failed",
                    detail=str(exc),
                )
            )

    # ── Stagnation ────────────────────────────
    elif growth_rate < STAGNATION_THRESHOLD:
        logger.info(
            "Stagnation detected for '%s' — rate=%.2f%%",
            brand_name, growth_rate * 100,
        )

        alerts.append(
            _alert(
                level="warning",
                brand_id=brand_id,
                brand_name=brand_name,
                title="Growth stagnation detected",
                detail=(
                    f"Week-over-week growth is only {growth_rate:+.1%} "
                    f"(threshold: {STAGNATION_THRESHOLD:+.1%}). "
                    f"Consider refreshing content pillars."
                ),
                metadata={
                    "previous_week": prev,
                    "current_week": curr,
                    "growth_rate": round(growth_rate, 4),
                },
            )
        )

    # ── Healthy growth ────────────────────────
    else:
        alerts.append(
            _alert(
                level="info",
                brand_id=brand_id,
                brand_name=brand_name,
                title="Healthy growth trend",
                detail=f"Engagement grew {growth_rate:+.1%} week-over-week.",
                metadata={
                    "previous_week": prev,
                    "current_week": curr,
                    "growth_rate": round(growth_rate, 4),
                },
            )
        )

    status = (
        "declining" if growth_rate < DECLINE_THRESHOLD
        else "stagnant" if growth_rate < STAGNATION_THRESHOLD
        else "healthy"
    )

    return {
        "brand_id": brand_id,
        "brand_name": brand_name,
        "weekly_scores": weekly,
        "growth_rate": round(growth_rate, 4),
        "status": status,
        "alerts": alerts,
        "cycle_triggered": cycle_triggered,
        "cycle_result": cycle_result,
    }


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def weekly_growth_check(
    db: AsyncSession,
) -> dict[str, Any]:
    """
    Run a weekly growth check across all brands.

    For each brand:
      • Compares last week's avg engagement with the prior week.
      • If decline → triggers `run_growth_cycle` automatically.
      • If stagnation → generates a warning alert.
      • If healthy → generates an info alert.

    Args:
        db: Async database session.

    Returns:
        dict with:
            - brands_checked  (int)
            - results         (list of per-brand result dicts)
            - alerts          (list of all alerts, sorted by severity)
            - cycles_triggered (int)
            - timestamp       (str)
    """
    logger.info("═══ Weekly growth check started ═══")

    result = await db.execute(select(BrandProfile))
    brands = list(result.scalars().all())

    if not brands:
        logger.info("No brands found — nothing to check")
        return {
            "brands_checked": 0,
            "results": [],
            "alerts": [],
            "cycles_triggered": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    results: list[dict[str, Any]] = []
    all_alerts: list[dict[str, Any]] = []
    cycles_triggered = 0

    for brand in brands:
        brand_result = await _check_brand(db, brand)
        results.append(brand_result)
        all_alerts.extend(brand_result["alerts"])
        if brand_result["cycle_triggered"]:
            cycles_triggered += 1

    # Sort alerts: critical → warning → info
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    all_alerts.sort(key=lambda a: severity_order.get(a["level"], 9))

    # Store monitoring run as agent memory
    await memory.store_memory(
        db,
        context_type="monitoring_run",
        content={
            "brands_checked": len(brands),
            "cycles_triggered": cycles_triggered,
            "alerts_count": len(all_alerts),
            "statuses": {r["brand_name"]: r["status"] for r in results},
        },
    )

    logger.info(
        "═══ Weekly check complete — %d brands, %d alerts, %d cycles triggered ═══",
        len(brands), len(all_alerts), cycles_triggered,
    )

    return {
        "brands_checked": len(brands),
        "results": results,
        "alerts": all_alerts,
        "cycles_triggered": cycles_triggered,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
