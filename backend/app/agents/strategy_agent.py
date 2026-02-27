"""
Strategy Agent for AI Brand Growth Copilot.

Generates a full 30-day content strategy for a brand — content pillars,
weekly themes, and a day-by-day content calendar — all aligned to the
brand's niche, audience, tone, and growth goal.
"""

import logging
from typing import Any

from app.services.claude_service import call_claude_json

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Prompt template
# ──────────────────────────────────────────────

STRATEGY_SYSTEM_PROMPT = (
    "You are an elite brand growth strategist and content marketing expert. "
    "You create actionable, data-driven content strategies that drive "
    "measurable growth across social platforms."
)

STRATEGY_USER_PROMPT = """\
Create a comprehensive 30-day content strategy for the following brand.

## Brand Profile
- **Name**: {name}
- **Niche**: {niche}
- **Target Audience**: {target_audience}
- **Brand Tone**: {tone}
- **Expertise Areas**: {expertise_areas}
- **Growth Goal**: {growth_goal}

## Instructions
1. Define 3–5 **content pillars** that align with the brand's expertise and audience needs.
2. Define a **weekly theme** for each of the 4 weeks, showing strategic progression.
3. Create a **day-by-day content calendar** (30 days) with specific post ideas.
4. Every post must include: platform, topic, content type, and a brief description.
5. Align everything toward achieving the stated growth goal.

## Required JSON Schema
Respond with ONLY a JSON object matching this exact structure:

{{
  "content_pillars": [
    {{
      "name": "Pillar Name",
      "description": "What this pillar covers and why it matters",
      "platforms": ["LinkedIn", "Twitter/X"]
    }}
  ],
  "weekly_themes": [
    {{
      "week": 1,
      "theme": "Theme Title",
      "objective": "What this week aims to achieve"
    }}
  ],
  "calendar": [
    {{
      "day": 1,
      "week": 1,
      "platform": "LinkedIn",
      "pillar": "Pillar Name",
      "content_type": "carousel | text | video | infographic | thread | story",
      "topic": "Post topic / headline",
      "description": "Brief description of the post content and angle",
      "cta": "Call to action for the post"
    }}
  ],
  "kpis": [
    {{
      "metric": "Metric name",
      "target": "Target value",
      "measurement": "How to measure"
    }}
  ]
}}
"""


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def generate_strategy(brand_profile: dict[str, Any]) -> dict[str, Any]:
    """
    Generate a full 30-day content strategy for a brand.

    Args:
        brand_profile: Dict with keys —
            name, niche, target_audience, tone,
            expertise_areas, growth_goal.

    Returns:
        Parsed JSON dict containing:
            - content_pillars  (list)
            - weekly_themes    (list)
            - calendar         (list of 30 day entries)
            - kpis             (list)

    Raises:
        ValueError:  If Claude fails to return valid JSON.
        TimeoutError: If the request exceeds the timeout.
        RuntimeError: On API errors.
    """
    name = brand_profile.get("name", "Unnamed Brand")
    niche = brand_profile.get("niche", "General")
    target_audience = brand_profile.get("target_audience", "Not specified")
    tone = brand_profile.get("tone", "Professional")
    expertise_areas = brand_profile.get("expertise_areas", "Not specified")
    growth_goal = brand_profile.get("growth_goal", "Grow audience and engagement")

    prompt = STRATEGY_USER_PROMPT.format(
        name=name,
        niche=niche,
        target_audience=target_audience,
        tone=tone,
        expertise_areas=expertise_areas,
        growth_goal=growth_goal,
    )

    logger.info("Generating 30-day strategy for brand '%s' [niche=%s]", name, niche)

    strategy = await call_claude_json(
        prompt,
        system_prompt=STRATEGY_SYSTEM_PROMPT,
        max_tokens=4096,
        temperature=0.4,
        timeout=60,
    )

    # ── Validate expected top-level keys ──────
    expected_keys = {"content_pillars", "weekly_themes", "calendar"}
    missing = expected_keys - set(strategy.keys())
    if missing:
        logger.warning(
            "Strategy response missing keys %s — response keys: %s",
            missing,
            list(strategy.keys()),
        )

    pillar_count = len(strategy.get("content_pillars", []))
    calendar_days = len(strategy.get("calendar", []))
    logger.info(
        "Strategy generated — %d pillars, %d calendar days, %d KPIs",
        pillar_count,
        calendar_days,
        len(strategy.get("kpis", [])),
    )

    return strategy
