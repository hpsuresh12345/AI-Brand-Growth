"""
No-Show Risk Agent for AI Real Estate Lead Conversion Engine.

Predicts the probability of a lead not showing up for a scheduled
site visit or callback, using Claude AI with structured JSON prompts.
"""

import logging
from typing import Any

from app.services.claude_service import call_claude

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Prompt Templates
# ──────────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are a real estate lead behavior analyst specializing in predicting "
    "appointment no-shows. Analyze lead data and engagement signals to "
    "predict no-show risk. Return ONLY valid JSON — no markdown, no explanation."
)

NO_SHOW_PROMPT_TEMPLATE = """
Predict whether the following real estate lead is likely to miss a scheduled site visit or callback.

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

--- ENGAGEMENT METRICS ---
Response Time: {response_time}
Messages Exchanged: {messages_exchanged}
Site Visits Scheduled: {site_visits_scheduled}
Site Visits Completed: {site_visits_completed}
Last Contact: {last_contact}
Preferred Contact Time: {preferred_contact_time}
--- END ---

Return ONLY a valid JSON object with these exact keys:
{{
    "risk_percentage": <integer 0-100, probability of no-show>,
    "risk_level": <"high" | "medium" | "low">,
    "reasoning": <string, 2-3 sentence explanation of key risk factors>,
    "warning_signs": [<list of 1-3 specific warning signs detected>],
    "suggested_mitigation": <string, one actionable step to reduce no-show risk>
}}

Risk assessment guidelines:
- No loan pre-approval + vague timeline = higher risk
- Slow response time + few messages = disengaged lead
- Multiple scheduled but uncompleted visits = very high risk
- "Immediately" timeline + pre-approved loan = low risk
- Short or generic initial message = moderate risk
- No preferred contact time = harder to reach, higher risk
"""

# ──────────────────────────────────────────────
# Required Fields in Response
# ──────────────────────────────────────────────

REQUIRED_FIELDS = {
    "risk_percentage": int,
    "risk_level": str,
    "reasoning": str,
    "warning_signs": list,
    "suggested_mitigation": str,
}

# ──────────────────────────────────────────────
# Validation
# ──────────────────────────────────────────────


def _validate_response(data: dict[str, Any]) -> dict[str, Any]:
    """Validate Claude's no-show prediction response."""
    for field, expected_type in REQUIRED_FIELDS.items():
        if field not in data:
            raise ValueError(f"Missing required field: '{field}'")
        if not isinstance(data[field], expected_type):
            raise ValueError(
                f"Invalid type for '{field}': "
                f"expected {expected_type.__name__}, got {type(data[field]).__name__}"
            )

    if not (0 <= data["risk_percentage"] <= 100):
        raise ValueError(f"risk_percentage out of range: {data['risk_percentage']}")
    if data["risk_level"] not in ("high", "medium", "low"):
        raise ValueError(f"Invalid risk_level: '{data['risk_level']}'")

    return data


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────


async def predict_no_show_risk(
    lead_data: dict[str, Any],
    engagement_metrics: dict[str, Any],
) -> dict[str, Any]:
    """
    Predict the no-show risk for a real estate lead.

    Args:
        lead_data: Lead fields — name, phone, budget, location, etc.
        engagement_metrics: Engagement signals — response_time,
            messages_exchanged, site_visits_scheduled,
            site_visits_completed, last_contact, preferred_contact_time.

    Returns:
        Validated dict with keys:
            - risk_percentage (int): 0–100
            - risk_level (str): "high" / "medium" / "low"
            - reasoning (str): Explanation of risk factors
            - warning_signs (list[str]): Detected warning signs
            - suggested_mitigation (str): Actionable step

    Raises:
        ValueError: If AI returns invalid or unparseable JSON.
        RuntimeError: If the Claude API call fails.
    """
    prompt = NO_SHOW_PROMPT_TEMPLATE.format(
        name=lead_data.get("name", "N/A"),
        phone=lead_data.get("phone", "N/A"),
        budget=lead_data.get("budget", "N/A"),
        location=lead_data.get("location", "N/A"),
        timeline=lead_data.get("timeline", "Not specified"),
        property_type=lead_data.get("property_type", "Not specified"),
        loan_status=lead_data.get("loan_status", "Not specified"),
        message=lead_data.get("message", "No message"),
        response_time=engagement_metrics.get("response_time", "Unknown"),
        messages_exchanged=engagement_metrics.get("messages_exchanged", 0),
        site_visits_scheduled=engagement_metrics.get("site_visits_scheduled", 0),
        site_visits_completed=engagement_metrics.get("site_visits_completed", 0),
        last_contact=engagement_metrics.get("last_contact", "Unknown"),
        preferred_contact_time=engagement_metrics.get("preferred_contact_time", "Not specified"),
    )

    logger.info("🔮  Predicting no-show risk for: %s", lead_data.get("name", "Unknown"))

    result = await call_claude(
        prompt,
        system_prompt=SYSTEM_PROMPT,
        temperature=0.3,
        max_tokens=512,
    )

    parsed = result.get("json")
    if parsed is None:
        logger.error("❌  Non-JSON response: %s", result["content"][:200])
        raise ValueError("AI returned invalid response. Expected JSON.")

    validated = _validate_response(parsed)

    logger.info(
        "✅  No-show prediction — name=%s risk=%d%% level=%s",
        lead_data.get("name"),
        validated["risk_percentage"],
        validated["risk_level"],
    )

    return validated
