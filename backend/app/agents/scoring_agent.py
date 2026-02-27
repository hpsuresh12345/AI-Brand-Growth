"""
Scoring Agent for AI Real Estate Lead Conversion Engine.

Combines AI-generated intelligence with rule-based heuristics
to produce a final lead score, category, and conversion probability.
"""

import logging
from typing import Any

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Rule-Based Scoring Weights
# ──────────────────────────────────────────────

WEIGHTS = {
    "ai_score": 0.50,       # Claude's intelligence score
    "budget": 0.15,         # Budget clarity and range
    "timeline": 0.15,       # Urgency of timeline
    "loan_status": 0.10,    # Financial readiness
    "message": 0.10,        # Engagement quality
}

TIMELINE_SCORES = {
    "immediately": 100,
    "1-3 months": 75,
    "3-6 months": 50,
    "6+ months": 25,
}

LOAN_SCORES = {
    "pre-approved": 100,
    "approved": 100,
    "applied": 60,
    "in progress": 40,
    "not started": 15,
}

CATEGORY_THRESHOLDS = {
    "Hot": 70,
    "Warm": 40,
    # Below 40 → Cold
}


# ──────────────────────────────────────────────
# Rule-Based Scoring Functions
# ──────────────────────────────────────────────


def _score_budget(budget: int) -> int:
    """Score based on budget range (higher = more serious buyer)."""
    if budget >= 10_000_000:    # ₹1 Cr+
        return 100
    if budget >= 5_000_000:     # ₹50L+
        return 80
    if budget >= 2_500_000:     # ₹25L+
        return 60
    if budget >= 1_000_000:     # ₹10L+
        return 40
    return 20


def _score_timeline(timeline: str | None) -> int:
    """Score based on purchase urgency."""
    if not timeline:
        return 10  # No timeline = low urgency signal

    normalized = timeline.strip().lower()
    for key, score in TIMELINE_SCORES.items():
        if key in normalized:
            return score
    return 30  # Unrecognized but present = moderate


def _score_loan_status(loan_status: str | None) -> int:
    """Score based on financial readiness."""
    if not loan_status:
        return 10

    normalized = loan_status.strip().lower()
    for key, score in LOAN_SCORES.items():
        if key in normalized:
            return score
    return 20


def _score_message(message: str | None) -> int:
    """Score based on message quality and engagement signals."""
    if not message:
        return 5

    length = len(message.strip())
    if length > 200:
        return 100  # Detailed inquiry = very engaged
    if length > 100:
        return 75
    if length > 30:
        return 50
    return 25  # Very short = low engagement


def _determine_category(final_score: int) -> str:
    """Map final score to category label."""
    if final_score >= CATEGORY_THRESHOLDS["Hot"]:
        return "Hot"
    if final_score >= CATEGORY_THRESHOLDS["Warm"]:
        return "Warm"
    return "Cold"


def _calculate_conversion_probability(
    final_score: int,
    ai_conversion: float,
) -> float:
    """
    Blend AI-predicted conversion with rule-based score.
    Weighted: 60% AI prediction, 40% normalized rule score.
    """
    rule_based_probability = final_score / 100.0
    blended = (ai_conversion * 0.6) + (rule_based_probability * 0.4)
    return round(min(max(blended, 0.0), 1.0), 2)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────


def score_lead(
    intelligence_data: dict[str, Any],
    lead_data: dict[str, Any],
) -> dict[str, Any]:
    """
    Produce a final lead score by combining AI intelligence
    with rule-based heuristics.

    Args:
        intelligence_data: Output from analyze_lead() containing
            score, category, conversion_probability, etc.
        lead_data: Raw lead fields — budget, timeline, loan_status, message.

    Returns:
        dict with keys:
            - score (int):                  Final blended score (0–100)
            - category (str):               "Hot" / "Warm" / "Cold"
            - conversion_probability (float): Blended probability (0.0–1.0)
            - score_breakdown (dict):       Per-factor scores for transparency
    """
    # Individual rule-based scores
    budget_score = _score_budget(lead_data.get("budget", 0))
    timeline_score = _score_timeline(lead_data.get("timeline"))
    loan_score = _score_loan_status(lead_data.get("loan_status"))
    message_score = _score_message(lead_data.get("message"))
    ai_score = intelligence_data.get("score", 0)

    # Weighted final score
    final_score = int(
        (ai_score * WEIGHTS["ai_score"])
        + (budget_score * WEIGHTS["budget"])
        + (timeline_score * WEIGHTS["timeline"])
        + (loan_score * WEIGHTS["loan_status"])
        + (message_score * WEIGHTS["message"])
    )
    final_score = min(max(final_score, 0), 100)

    # Derived metrics
    category = _determine_category(final_score)
    conversion_probability = _calculate_conversion_probability(
        final_score,
        intelligence_data.get("conversion_probability", 0.0),
    )

    logger.info(
        "📊  Lead scored — final=%d category=%s conversion=%.2f "
        "(ai=%d budget=%d timeline=%d loan=%d message=%d)",
        final_score,
        category,
        conversion_probability,
        ai_score,
        budget_score,
        timeline_score,
        loan_score,
        message_score,
    )

    return {
        "score": final_score,
        "category": category,
        "conversion_probability": conversion_probability,
        "score_breakdown": {
            "ai_score": ai_score,
            "budget_score": budget_score,
            "timeline_score": timeline_score,
            "loan_score": loan_score,
            "message_score": message_score,
            "weights": WEIGHTS,
        },
    }
