"""
Decision Engine for AI Brand Growth Copilot.

Analyses engagement metrics and growth trends, detects
underperformance and stagnation, and returns a prioritised
list of corrective actions for the agent orchestrator.
"""

import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Configurable Thresholds
# ──────────────────────────────────────────────

DEFAULT_ENGAGEMENT_THRESHOLD = 0.3      # below this → optimisation cycle
STAGNATION_WINDOW = 7                   # days to look back for trend
STAGNATION_GROWTH_RATE = 0.02           # < 2% week-over-week = stagnant
PILLAR_UNDERPERFORM_THRESHOLD = 0.25    # per-pillar floor

# Action priority levels (lower = more urgent)
PRIORITY_CRITICAL = 1
PRIORITY_HIGH = 2
PRIORITY_MEDIUM = 3
PRIORITY_LOW = 4


# ──────────────────────────────────────────────
# Data structures
# ──────────────────────────────────────────────

def _action(
    priority: int,
    action_type: str,
    title: str,
    detail: str,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a standardised action dict."""
    return {
        "priority": priority,
        "action_type": action_type,
        "title": title,
        "detail": detail,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# ──────────────────────────────────────────────
# Detection: low engagement
# ──────────────────────────────────────────────

def _check_engagement(
    content_scores: list[dict[str, Any]],
    threshold: float = DEFAULT_ENGAGEMENT_THRESHOLD,
) -> list[dict[str, Any]]:
    """
    Flag content pieces whose engagement_score < threshold
    and recommend an optimisation cycle.

    Args:
        content_scores: List of dicts with at least
            {id, topic, platform, engagement_score}.
        threshold: Engagement floor (0.0 – 1.0).

    Returns:
        List of action dicts for underperforming content.
    """
    actions: list[dict[str, Any]] = []

    underperformers = [
        c for c in content_scores
        if (c.get("engagement_score") or 0) < threshold
    ]

    if not underperformers:
        return actions

    logger.info(
        "%d / %d content pieces below engagement threshold (%.2f)",
        len(underperformers), len(content_scores), threshold,
    )

    # If majority underperforms → critical
    ratio = len(underperformers) / max(len(content_scores), 1)
    priority = PRIORITY_CRITICAL if ratio > 0.5 else PRIORITY_HIGH

    actions.append(
        _action(
            priority=priority,
            action_type="optimize_content",
            title="Trigger content optimisation cycle",
            detail=(
                f"{len(underperformers)} content piece(s) scored below "
                f"{threshold:.0%} engagement. Re-evaluate hooks, CTAs, "
                f"and formatting for these posts."
            ),
            metadata={
                "underperforming_ids": [c.get("id") for c in underperformers],
                "avg_score": round(
                    sum(c.get("engagement_score", 0) for c in underperformers)
                    / max(len(underperformers), 1),
                    3,
                ),
                "threshold": threshold,
            },
        )
    )

    return actions


# ──────────────────────────────────────────────
# Detection: growth stagnation
# ──────────────────────────────────────────────

def _check_stagnation(
    weekly_scores: list[float],
    min_growth_rate: float = STAGNATION_GROWTH_RATE,
) -> list[dict[str, Any]]:
    """
    Detect growth stagnation by comparing recent weekly averages.

    Args:
        weekly_scores: Ordered list of weekly average engagement
            scores (oldest → newest). Needs at least 2 entries.
        min_growth_rate: Minimum week-over-week growth rate to
            be considered "not stagnant".

    Returns:
        List of action dicts if stagnation is detected.
    """
    actions: list[dict[str, Any]] = []

    if len(weekly_scores) < 2:
        return actions

    prev, curr = weekly_scores[-2], weekly_scores[-1]

    # Avoid division by zero
    if prev == 0:
        return actions

    growth_rate = (curr - prev) / abs(prev)

    if growth_rate >= min_growth_rate:
        return actions

    is_declining = growth_rate < 0
    priority = PRIORITY_CRITICAL if is_declining else PRIORITY_HIGH

    logger.warning(
        "Growth %s detected — rate=%.2f%% (threshold=%.2f%%)",
        "decline" if is_declining else "stagnation",
        growth_rate * 100,
        min_growth_rate * 100,
    )

    actions.append(
        _action(
            priority=priority,
            action_type="adjust_pillars",
            title="Adjust content pillars — growth stagnation detected",
            detail=(
                f"Week-over-week engagement {'declined' if is_declining else 'stagnated'} "
                f"at {growth_rate:+.1%} (min required: {min_growth_rate:+.1%}). "
                f"Re-evaluate content pillars, test new topics, or shift "
                f"platform mix to reignite growth."
            ),
            metadata={
                "previous_week_avg": round(prev, 3),
                "current_week_avg": round(curr, 3),
                "growth_rate": round(growth_rate, 4),
                "is_declining": is_declining,
            },
        )
    )

    # If declining, also suggest an A/B test
    if is_declining:
        actions.append(
            _action(
                priority=PRIORITY_MEDIUM,
                action_type="ab_test",
                title="Run A/B content experiment",
                detail=(
                    "Engagement is declining. Test 2–3 content variations "
                    "with different hooks, formats, or posting times to "
                    "identify what resonates with the current audience."
                ),
            )
        )

    return actions


# ──────────────────────────────────────────────
# Detection: pillar imbalance
# ──────────────────────────────────────────────

def _check_pillar_performance(
    pillar_scores: dict[str, float],
    threshold: float = PILLAR_UNDERPERFORM_THRESHOLD,
) -> list[dict[str, Any]]:
    """
    Identify content pillars that consistently underperform.

    Args:
        pillar_scores: Mapping of pillar name → avg engagement score.
        threshold: Minimum acceptable pillar score.

    Returns:
        List of action dicts for weak pillars.
    """
    actions: list[dict[str, Any]] = []

    weak = {k: v for k, v in pillar_scores.items() if v < threshold}

    if not weak:
        return actions

    logger.info("Weak pillars detected: %s", list(weak.keys()))

    actions.append(
        _action(
            priority=PRIORITY_HIGH,
            action_type="replace_pillars",
            title="Replace or refresh underperforming content pillars",
            detail=(
                f"Pillar(s) {', '.join(weak.keys())} averaged below "
                f"{threshold:.0%} engagement. Consider replacing them "
                f"with topics that better match audience interests."
            ),
            metadata={"weak_pillars": weak, "threshold": threshold},
        )
    )

    return actions


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def evaluate(
    content_scores: list[dict[str, Any]],
    weekly_scores: list[float] | None = None,
    pillar_scores: dict[str, float] | None = None,
    *,
    engagement_threshold: float = DEFAULT_ENGAGEMENT_THRESHOLD,
    growth_rate_threshold: float = STAGNATION_GROWTH_RATE,
) -> dict[str, Any]:
    """
    Run all decision checks and return prioritised actions.

    Args:
        content_scores:  List of content dicts with engagement_score.
        weekly_scores:   Ordered weekly avg scores (oldest → newest).
        pillar_scores:   Mapping of pillar name → avg engagement.
        engagement_threshold: Floor for per-content engagement.
        growth_rate_threshold: Min week-over-week growth rate.

    Returns:
        dict with:
            - actions  (list): Sorted by priority (most urgent first).
            - summary  (dict): Counts by action_type.
            - needs_attention (bool): True if any CRITICAL actions exist.
    """
    actions: list[dict[str, Any]] = []

    # 1. Content-level engagement
    actions.extend(
        _check_engagement(content_scores, engagement_threshold)
    )

    # 2. Growth stagnation
    if weekly_scores:
        actions.extend(
            _check_stagnation(weekly_scores, growth_rate_threshold)
        )

    # 3. Pillar imbalance
    if pillar_scores:
        actions.extend(
            _check_pillar_performance(pillar_scores)
        )

    # Sort by priority (ascending = most urgent first)
    actions.sort(key=lambda a: a["priority"])

    # Summary
    type_counts: dict[str, int] = {}
    for a in actions:
        t = a["action_type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    needs_attention = any(a["priority"] == PRIORITY_CRITICAL for a in actions)

    logger.info(
        "Decision engine complete — %d action(s), needs_attention=%s",
        len(actions), needs_attention,
    )

    return {
        "actions": actions,
        "summary": type_counts,
        "needs_attention": needs_attention,
    }
