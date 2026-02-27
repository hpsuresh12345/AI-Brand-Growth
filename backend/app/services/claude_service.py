"""
Claude AI Service for AI Brand Growth Copilot.

Provides a production-grade async interface to the Anthropic Claude API
with structured JSON enforcement, timeout handling, and comprehensive
error management.
"""

import asyncio
import json
import logging
from typing import Any

import anthropic

from app.config import get_settings

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1024
REQUEST_TIMEOUT_SECONDS = 30

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Lazy-initialised Async Client
# ──────────────────────────────────────────────

_client: anthropic.AsyncAnthropic | None = None


def _get_client() -> anthropic.AsyncAnthropic:
    """
    Lazily initialise and return the Anthropic async client.

    Reads the API key from settings (ANTHROPIC_API_KEY env var).
    Raises a clear error if the key is missing.
    """
    global _client

    if _client is not None:
        return _client

    settings = get_settings()
    api_key = settings.anthropic_api_key

    if not api_key:
        raise EnvironmentError(
            "ANTHROPIC_API_KEY is not set. "
            "Add it to your .env file or export it as an environment variable."
        )

    _client = anthropic.AsyncAnthropic(
        api_key=api_key,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    logger.info("Anthropic async client initialised")
    return _client


# ──────────────────────────────────────────────
# JSON extraction helper
# ──────────────────────────────────────────────

def _extract_json(text: str) -> dict[str, Any] | None:
    """
    Attempt to parse JSON from Claude's response.

    Handles both raw JSON and JSON wrapped in ```json fences.
    Returns None if parsing fails.
    """
    stripped = text.strip()

    # Direct parse
    try:
        return json.loads(stripped)
    except (json.JSONDecodeError, TypeError):
        pass

    # Strip markdown code fences
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        # Remove first and last fence lines
        inner = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        try:
            return json.loads(inner.strip())
        except (json.JSONDecodeError, TypeError):
            pass

    return None


# ──────────────────────────────────────────────
# Core API Call — general purpose
# ──────────────────────────────────────────────

async def call_claude(
    prompt: str,
    *,
    system_prompt: str = "You are an expert AI brand growth strategist.",
    model: str = MODEL,
    max_tokens: int = MAX_TOKENS,
    temperature: float = 0.7,
    timeout: float = REQUEST_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """
    Send a prompt to Claude and return the response.

    Args:
        prompt:        The user-facing message / instruction.
        system_prompt: System-level instruction to set Claude's behaviour.
        model:         Claude model identifier.
        max_tokens:    Maximum tokens in the response.
        temperature:   Sampling temperature (0.0 = deterministic, 1.0 = creative).
        timeout:       Per-request timeout in seconds.

    Returns:
        dict with keys:
            - "content"  (str):         Raw text response from Claude.
            - "json"     (dict | None): Parsed JSON if the response is valid JSON.
            - "model"    (str):         Model used.
            - "usage"    (dict):        Token usage stats.
    """
    client = _get_client()
    logger.info("Sending prompt to Claude (%s) — %d chars", model, len(prompt))

    try:
        response = await asyncio.wait_for(
            client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[{"role": "user", "content": prompt}],
            ),
            timeout=timeout,
        )

    except asyncio.TimeoutError:
        logger.error("Claude request timed out after %.1fs", timeout)
        raise TimeoutError(
            f"Claude API request timed out after {timeout}s. "
            "Try increasing the timeout or simplifying the prompt."
        )
    except anthropic.AuthenticationError:
        logger.error("Invalid Anthropic API key")
        raise ValueError(
            "Invalid Anthropic API key. Check your ANTHROPIC_API_KEY."
        )
    except anthropic.RateLimitError:
        logger.warning("Rate-limited by Anthropic API")
        raise RuntimeError(
            "Claude API rate limit reached. Please try again shortly."
        )
    except anthropic.APIError as exc:
        logger.error("Anthropic API error: %s", exc)
        raise RuntimeError(f"Claude API error: {exc}") from exc

    raw_text = response.content[0].text
    logger.info(
        "Response received — %d chars, %d in / %d out tokens",
        len(raw_text),
        response.usage.input_tokens,
        response.usage.output_tokens,
    )

    return {
        "content": raw_text,
        "json": _extract_json(raw_text),
        "model": response.model,
        "usage": {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
        },
    }


# ──────────────────────────────────────────────
# Structured JSON call — enforced JSON output
# ──────────────────────────────────────────────

async def call_claude_json(
    prompt: str,
    *,
    system_prompt: str = "You are an expert AI brand growth strategist.",
    model: str = MODEL,
    max_tokens: int = MAX_TOKENS,
    temperature: float = 0.3,
    timeout: float = REQUEST_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """
    Call Claude with strict JSON output enforcement.

    Injects a JSON-only instruction into the system prompt and
    validates the response. Raises ValueError if Claude fails
    to return parseable JSON.

    Returns:
        The parsed JSON dict directly (not wrapped).
    """
    json_system = (
        f"{system_prompt}\n\n"
        "IMPORTANT: You MUST respond with valid JSON only. "
        "No markdown fences, no commentary, no extra text — "
        "just a single JSON object."
    )

    result = await call_claude(
        prompt,
        system_prompt=json_system,
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        timeout=timeout,
    )

    parsed = result["json"]
    if parsed is None:
        logger.error("Claude did not return valid JSON: %s", result["content"][:200])
        raise ValueError(
            "Claude failed to return valid JSON. "
            "Raw response (truncated): " + result["content"][:300]
        )

    return parsed
