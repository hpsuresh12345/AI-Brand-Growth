"""
Content Agent for AI Brand Growth Copilot.

Generates platform-optimised, brand-aligned content pieces with
strong hooks, structured formatting, and clear calls to action.
"""

import logging
from typing import Any

from app.services.claude_service import call_claude_json

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Platform formatting guidelines
# ──────────────────────────────────────────────

PLATFORM_GUIDELINES: dict[str, str] = {
    "LinkedIn": (
        "- Max ~3 000 characters (aim for 1 200–1 800 for engagement)\n"
        "- Open with a bold 1-line hook (pattern interrupt)\n"
        "- Use short paragraphs (1–2 sentences each)\n"
        "- Add line breaks between every paragraph for readability\n"
        "- Use bullet points or numbered lists for key takeaways\n"
        "- Include 3–5 relevant hashtags at the end\n"
        "- Professional yet conversational tone works best"
    ),
    "Twitter/X": (
        "- Primary tweet: max 280 characters, punchy and scroll-stopping\n"
        "- If thread: 4–8 tweets, each self-contained but flowing\n"
        "- Use line breaks, emojis sparingly, and strong openers\n"
        "- End with a clear CTA or question to drive engagement\n"
        "- No hashtag spam — 1–2 max, woven naturally"
    ),
    "Instagram": (
        "- Caption: 150–300 words, story-driven\n"
        "- Open with a hook (first line visible before 'more')\n"
        "- Use emojis as visual breaks (not excessive)\n"
        "- End with CTA + 5–10 niche hashtags in a separate block\n"
        "- If carousel: provide slide-by-slide text breakdown"
    ),
    "YouTube": (
        "- Title: compelling, keyword-rich, under 60 characters\n"
        "- Description: 200–400 words with timestamps and links\n"
        "- Provide a video script outline with intro hook, sections, and outro CTA\n"
        "- Include 5–8 tags / keywords"
    ),
}

DEFAULT_GUIDELINES = (
    "- Write platform-appropriate content\n"
    "- Use short paragraphs and clear structure\n"
    "- Include a CTA at the end"
)

# ──────────────────────────────────────────────
# Prompt template
# ──────────────────────────────────────────────

CONTENT_SYSTEM_PROMPT = (
    "You are an expert social media copywriter and content strategist. "
    "You write high-converting, audience-first content that feels authentic "
    "to the brand voice while maximising reach and engagement."
)

CONTENT_USER_PROMPT = """\
Create a ready-to-publish content piece for the following brand and platform.

## Brand Profile
- **Name**: {name}
- **Niche**: {niche}
- **Target Audience**: {target_audience}
- **Brand Tone**: {tone}
- **Expertise Areas**: {expertise_areas}

## Content Brief
- **Platform**: {platform}
- **Topic**: {topic}

## Platform-Specific Guidelines
{platform_guidelines}

## Requirements
1. Start with a **strong hook** — the first line must stop the scroll.
2. Write in the brand's exact tone: **{tone}**.
3. Provide actionable value or a compelling narrative.
4. End with a clear **call to action** (CTA).
5. Include hashtags/tags if appropriate for the platform.

## Required JSON Schema
Respond with ONLY a JSON object matching this exact structure:

{{
  "hook": "The opening hook / first line",
  "body": "The full content body (use \\n for line breaks)",
  "cta": "The call-to-action line",
  "hashtags": ["hashtag1", "hashtag2"],
  "content_type": "text | carousel | thread | video_script | story",
  "estimated_read_time": "e.g. 30 sec",
  "engagement_tips": [
    "Tip for maximising reach with this post"
  ]
}}
"""


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def generate_content(
    brand_profile: dict[str, Any],
    platform: str,
    topic: str,
) -> dict[str, Any]:
    """
    Generate a platform-optimised content piece for a brand.

    Args:
        brand_profile: Dict with keys —
            name, niche, target_audience, tone, expertise_areas.
        platform:  Target platform (e.g. "LinkedIn", "Twitter/X").
        topic:     Content topic or headline to write about.

    Returns:
        Parsed JSON dict containing:
            - hook              (str)
            - body              (str)
            - cta               (str)
            - hashtags          (list[str])
            - content_type      (str)
            - estimated_read_time (str)
            - engagement_tips   (list[str])

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

    platform_guidelines = PLATFORM_GUIDELINES.get(platform, DEFAULT_GUIDELINES)

    prompt = CONTENT_USER_PROMPT.format(
        name=name,
        niche=niche,
        target_audience=target_audience,
        tone=tone,
        expertise_areas=expertise_areas,
        platform=platform,
        topic=topic,
        platform_guidelines=platform_guidelines,
    )

    logger.info(
        "Generating content for '%s' on %s — topic: %s",
        name, platform, topic,
    )

    content = await call_claude_json(
        prompt,
        system_prompt=CONTENT_SYSTEM_PROMPT,
        max_tokens=2048,
        temperature=0.7,
        timeout=45,
    )

    # ── Validate expected keys ────────────────
    expected_keys = {"hook", "body", "cta"}
    missing = expected_keys - set(content.keys())
    if missing:
        logger.warning(
            "Content response missing keys %s — got: %s",
            missing,
            list(content.keys()),
        )

    logger.info(
        "Content generated — type=%s, body_length=%d chars",
        content.get("content_type", "unknown"),
        len(content.get("body", "")),
    )

    return content
