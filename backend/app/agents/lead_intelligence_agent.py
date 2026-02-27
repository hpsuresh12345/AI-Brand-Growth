"""
Lead Intelligence Agent for AI Real Estate Lead Conversion Engine.

Analyzes raw lead data using Claude to produce structured scoring,
categorization, and conversion predictions.
"""

import logging
from typing import Any

from app.services.claude_service import call_claude

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Expected Response Schema
# ──────────────────────────────────────────────

REQUIRED_FIELDS = {
    "score": int,
    "category": str,
    "conversion_probability": (int, float),
    "no_show_risk": (int, float),
    "summary": str,
    "recommended_action": str,
}

# ──────────────────────────────────────────────
# Prompt Template
# ──────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are a senior real estate lead qualification AI. "
    "You analyze lead data and return ONLY valid JSON — no markdown, no explanation."
)

ANALYSIS_PROMPT_TEMPLATE = """
Analyze the following real estate lead and return a JSON object with your assessment.

--- LEAD DATA ---
Name: {name}
Phone: {phone}
Budget: ₹{budget}
Location: {location}
Timeline: {timeline}
Property Type: {property_type}
Loan Status: {loan_status}
Message: {message}
--- END ---

Return ONLY a valid JSON object with these exact keys:
{{
    "score": <integer 0-100, overall lead quality score>,
    "category": <"Hot" | "Warm" | "Cold">,
    "conversion_probability": <float 0.0-1.0>,
    "no_show_risk": <float 0.0-1.0>,
    "summary": <string, 1-2 sentence analysis of the lead>,
    "recommended_action": <string, specific next step for the sales team>
}}

Scoring guidelines:
- Budget clarity + loan pre-approval = higher score
- "Immediately" timeline = higher conversion probability
- Vague message + no timeline = higher no-show risk
- Location specificity matters for quality
"""

# ──────────────────────────────────────────────
# Response Validation
# ──────────────────────────────────────────────


def _validate_response(data: dict[str, Any]) -> dict[str, Any]:
    """
    Validate that Claude's response contains all required fields
    with correct types. Raises ValueError on failure.
    """
    for field, expected_type in REQUIRED_FIELDS.items():
        if field not in data:
            raise ValueError(f"Missing required field in AI response: '{field}'")
        if not isinstance(data[field], expected_type):
            raise ValueError(
                f"Invalid type for '{field}': "
                f"expected {expected_type}, got {type(data[field]).__name__}"
            )

    # Range validation
    if not (0 <= data["score"] <= 100):
        raise ValueError(f"Score out of range: {data['score']} (expected 0-100)")
    if not (0.0 <= data["conversion_probability"] <= 1.0):
        raise ValueError(
            f"conversion_probability out of range: {data['conversion_probability']}"
        )
    if not (0.0 <= data["no_show_risk"] <= 1.0):
        raise ValueError(f"no_show_risk out of range: {data['no_show_risk']}")
    # Normalize category to title case (Claude might return any casing)
    data["category"] = data["category"].strip().capitalize()

    if data["category"] not in ("Hot", "Warm", "Cold"):
        raise ValueError(f"Invalid category: '{data['category']}'")

    return data


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────


async def analyze_lead(lead: dict[str, Any]) -> dict[str, Any]:
    """
    Analyze a real estate lead using Claude and return structured intelligence.

    Args:
        lead: Dictionary with keys — name, phone, budget, location,
              timeline, property_type, loan_status, message.

    Returns:
        Validated dict with keys:
            score, category, conversion_probability,
            no_show_risk, summary, recommended_action.

    Raises:
        ValueError: If Claude returns invalid or unparseable JSON.
        RuntimeError: If the Claude API call fails.
    """
    prompt = ANALYSIS_PROMPT_TEMPLATE.format(
        name=lead.get("name", "N/A"),
        phone=lead.get("phone", "N/A"),
        budget=lead.get("budget", "N/A"),
        location=lead.get("location", "N/A"),
        timeline=lead.get("timeline", "Not specified"),
        property_type=lead.get("property_type", "Not specified"),
        loan_status=lead.get("loan_status", "Not specified"),
        message=lead.get("message", "No message"),
    )

    logger.info("🧠  Analyzing lead: %s", lead.get("name", "Unknown"))

    result = await call_claude(
        prompt,
        system_prompt=SYSTEM_PROMPT,
        temperature=0.3,  # Low temperature for consistent scoring
    )

    # Ensure valid JSON was returned
    parsed = result.get("json")
    if parsed is None:
        logger.error("❌  Claude returned non-JSON response: %s", result["content"][:200])
        raise ValueError(
            "AI returned an invalid response. Expected JSON but got plain text."
        )

    # Validate structure and ranges
    validated = _validate_response(parsed)

    logger.info(
        "✅  Lead scored — name=%s score=%d category=%s conversion=%.2f",
        lead.get("name"),
        validated["score"],
        validated["category"],
        validated["conversion_probability"],
    )

    return validated
