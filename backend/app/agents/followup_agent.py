"""
Follow-Up Agent for AI Real Estate Lead Conversion Engine.

Generates personalized WhatsApp follow-up messages using Claude,
tailored to lead category and intent. Designed for Bangalore
real estate professionals.
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
    "You are an experienced Bangalore real estate sales consultant. "
    "Write WhatsApp messages that are warm, professional, and action-oriented. "
    "Return ONLY the message text — no quotes, no labels, no explanation."
)

FOLLOWUP_PROMPT_TEMPLATE = """
Write a WhatsApp follow-up message for the following real estate lead.

--- LEAD INFO ---
Name: {name}
Budget: ₹{budget}
Location: {location}
Timeline: {timeline}
Property Type: {property_type}
Loan Status: {loan_status}
Original Message: {message}
Lead Category: {category}
--- END ---

Rules:
- Tone: Professional yet friendly, Bangalore real estate style
- Must encourage a site visit or callback
- Address the lead by first name
- Mention their location and budget range naturally
- Under 120 words strictly
- {category_instruction}
- Do NOT use markdown or formatting — plain WhatsApp text only
- Include a clear call-to-action at the end

Return ONLY the message text, nothing else.
"""

CATEGORY_INSTRUCTIONS = {
    "Hot": "This is a HIGH-PRIORITY lead. Create urgency — mention limited availability or exclusive deals.",
    "Warm": "This is a WARM lead. Be helpful and informative — offer to share floor plans or schedule a visit.",
    "Cold": "This is a COLD lead. Be gentle and nurturing — share a useful insight or market update to re-engage.",
}


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────


async def generate_whatsapp_message(
    lead_data: dict[str, Any],
    category: str,
) -> str:
    """
    Generate a personalized WhatsApp follow-up message for a lead.

    Args:
        lead_data: Dictionary with lead fields (name, budget, location, etc.)
        category:  Lead category — "Hot", "Warm", or "Cold"

    Returns:
        Plain text WhatsApp message string (under 120 words).

    Raises:
        ValueError: If Claude returns an empty response.
        RuntimeError: If the Claude API call fails.
    """
    category_instruction = CATEGORY_INSTRUCTIONS.get(
        category, CATEGORY_INSTRUCTIONS["Warm"]
    )

    prompt = FOLLOWUP_PROMPT_TEMPLATE.format(
        name=lead_data.get("name", "there"),
        budget=lead_data.get("budget", "N/A"),
        location=lead_data.get("location", "Bangalore"),
        timeline=lead_data.get("timeline", "Not specified"),
        property_type=lead_data.get("property_type", "Not specified"),
        loan_status=lead_data.get("loan_status", "Not specified"),
        message=lead_data.get("message", "No message"),
        category=category,
        category_instruction=category_instruction,
    )

    logger.info(
        "💬  Generating WhatsApp message for %s (category=%s)",
        lead_data.get("name", "Unknown"),
        category,
    )

    result = await call_claude(
        prompt,
        system_prompt=SYSTEM_PROMPT,
        temperature=0.8,  # Higher creativity for natural messaging
        max_tokens=300,
    )

    message = result["content"].strip()

    if not message:
        raise ValueError("AI returned an empty follow-up message.")

    logger.info(
        "✅  WhatsApp message generated — %d chars, %d words",
        len(message),
        len(message.split()),
    )

    return message
