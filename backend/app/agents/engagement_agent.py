"""
Engagement Agent for AI Brand Growth Copilot.

Evaluates content performance against engagement metrics,
diagnoses strengths and weaknesses, suggests improvements,
and provides an optimised rewrite.
"""

import logging
from typing import Any

from app.services.claude_service import call_claude_json

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Prompt template
# ──────────────────────────────────────────────

ENGAGEMENT_SYSTEM_PROMPT = (
    "You are an elite social media performance analyst and copywriter. "
    "You diagnose why content underperforms or overperforms, provide "
    "actionable improvement strategies, and can rewrite content for "
    "maximum engagement."
)

ENGAGEMENT_USER_PROMPT = """\
Evaluate the performance of the following content and provide a full diagnosis.

## Original Content
{content_text}

## Engagement Metrics
- **Likes**: {likes}
- **Comments**: {comments}
- **Shares**: {shares}

## Instructions
1. **Diagnose** — Analyse why the content performed at this level.
   Consider hook strength, value density, readability, emotional trigger,
   CTA clarity, and formatting.
2. **Score** — Rate the content 1–10 on each diagnostic dimension.
3. **Suggest** — Provide 3–5 specific, actionable improvements.
4. **Rewrite** — Produce a fully optimised version of the content
   incorporating all suggested improvements. Keep the same core message
   but maximise engagement potential.

## Required JSON Schema
Respond with ONLY a JSON object matching this exact structure:

{{
  "diagnosis": {{
    "summary": "2–3 sentence overall performance assessment",
    "hook_strength": {{
      "score": 7,
      "analysis": "Why the hook works or doesn't"
    }},
    "value_density": {{
      "score": 6,
      "analysis": "Whether the content delivers enough actionable value"
    }},
    "readability": {{
      "score": 8,
      "analysis": "Formatting, paragraph length, scannability"
    }},
    "emotional_trigger": {{
      "score": 5,
      "analysis": "Does it evoke curiosity, fear, aspiration, etc."
    }},
    "cta_clarity": {{
      "score": 4,
      "analysis": "How clear and compelling the call to action is"
    }}
  }},
  "overall_score": 6.0,
  "improvements": [
    {{
      "area": "Hook",
      "current": "What the current content does",
      "suggested": "Specific actionable improvement"
    }}
  ],
  "optimised_content": {{
    "hook": "The new opening hook",
    "body": "The full rewritten content body (use \\n for line breaks)",
    "cta": "The improved call to action"
  }},
  "predicted_lift": "Estimated engagement improvement, e.g. '+40-60% engagement'"
}}
"""


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def evaluate_content(
    content_text: str,
    metrics: dict[str, Any],
) -> dict[str, Any]:
    """
    Evaluate content performance and generate an optimised rewrite.

    Args:
        content_text: The original content body to evaluate.
        metrics: Dict with engagement numbers —
            likes (int), comments (int), shares (int).

    Returns:
        Parsed JSON dict containing:
            - diagnosis         (dict)  — per-dimension scores & analysis
            - overall_score     (float) — 1–10 composite score
            - improvements      (list)  — actionable suggestions
            - optimised_content (dict)  — rewritten hook, body, cta
            - predicted_lift    (str)   — estimated engagement improvement

    Raises:
        ValueError:  If Claude fails to return valid JSON.
        TimeoutError: If the request exceeds the timeout.
        RuntimeError: On API errors.
    """
    likes = metrics.get("likes", 0)
    comments = metrics.get("comments", 0)
    shares = metrics.get("shares", 0)

    prompt = ENGAGEMENT_USER_PROMPT.format(
        content_text=content_text,
        likes=likes,
        comments=comments,
        shares=shares,
    )

    logger.info(
        "Evaluating content (%d chars) — likes=%d comments=%d shares=%d",
        len(content_text), likes, comments, shares,
    )

    result = await call_claude_json(
        prompt,
        system_prompt=ENGAGEMENT_SYSTEM_PROMPT,
        max_tokens=3072,
        temperature=0.4,
        timeout=45,
    )

    # ── Validate expected keys ────────────────
    expected_keys = {"diagnosis", "improvements", "optimised_content", "overall_score"}
    missing = expected_keys - set(result.keys())
    if missing:
        logger.warning(
            "Evaluation response missing keys %s — got: %s",
            missing,
            list(result.keys()),
        )

    logger.info(
        "Content evaluated — overall_score=%.1f, %d improvements, predicted_lift=%s",
        result.get("overall_score", 0),
        len(result.get("improvements", [])),
        result.get("predicted_lift", "N/A"),
    )

    return result
