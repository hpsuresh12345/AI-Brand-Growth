"""
AI Service for AI Brand Growth Copilot.

Provides a production-grade async interface to the OpenAI GPT API
with structured JSON enforcement, timeout handling, and comprehensive
error management.

Drop-in replacement for the original Claude service — exposes the same
``call_claude()`` and ``call_claude_json()`` function signatures so that
all existing agents continue to work without import changes.
"""

import asyncio
import json
import logging
from typing import Any

from openai import AsyncOpenAI, AuthenticationError, RateLimitError, APIError

from app.config import get_settings

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

MODEL = "gpt-4o-mini"
MAX_TOKENS = 1024
REQUEST_TIMEOUT_SECONDS = 60

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Lazy-initialised Async Client
# ──────────────────────────────────────────────

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    """
    Lazily initialise and return the OpenAI async client.

    Reads the API key from settings (OPENAI_API_KEY env var).
    Raises a clear error if the key is missing.
    """
    global _client

    if _client is not None:
        return _client

    settings = get_settings()
    api_key = settings.openai_api_key

    if not api_key:
        raise EnvironmentError(
            "OPENAI_API_KEY is not set. "
            "Add it to your .env file or export it as an environment variable."
        )

    _client = AsyncOpenAI(
        api_key=api_key,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    logger.info("OpenAI async client initialised")
    return _client


# ──────────────────────────────────────────────
# JSON extraction helper
# ──────────────────────────────────────────────

def _extract_json(text: str) -> dict[str, Any] | None:
    """
    Attempt to parse JSON from GPT's response.

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
    Send a prompt to GPT and return the response.

    Function name kept as ``call_claude`` for backward compatibility
    with all existing agent imports.

    Args:
        prompt:        The user-facing message / instruction.
        system_prompt: System-level instruction.
        model:         GPT model identifier.
        max_tokens:    Maximum tokens in the response.
        temperature:   Sampling temperature.
        timeout:       Per-request timeout in seconds.

    Returns:
        dict with keys:
            - "content"  (str):         Raw text response.
            - "json"     (dict | None): Parsed JSON if valid.
            - "model"    (str):         Model used.
            - "usage"    (dict):        Token usage stats.
    """
    client = _get_client()
    logger.info("Sending prompt to GPT (%s) — %d chars", model, len(prompt))

    try:
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
            ),
            timeout=timeout,
        )

    except asyncio.TimeoutError:
        logger.error("GPT request timed out after %.1fs", timeout)
        raise TimeoutError(
            f"GPT API request timed out after {timeout}s. "
            "Try increasing the timeout or simplifying the prompt."
        )
    except AuthenticationError:
        logger.error("Invalid OpenAI API key")
        raise ValueError(
            "Invalid OpenAI API key. Check your OPENAI_API_KEY."
        )
    except RateLimitError:
        logger.warning("Rate-limited by OpenAI API")
        raise RuntimeError(
            "GPT API rate limit reached. Please try again shortly."
        )
    except APIError as exc:
        logger.error("OpenAI API error: %s", exc)
        raise RuntimeError(f"GPT API error: {exc}") from exc

    raw_text = response.choices[0].message.content
    usage = response.usage

    logger.info(
        "Response received — %d chars, %d in / %d out tokens",
        len(raw_text),
        usage.prompt_tokens if usage else 0,
        usage.completion_tokens if usage else 0,
    )

    return {
        "content": raw_text,
        "json": _extract_json(raw_text),
        "model": response.model,
        "usage": {
            "input_tokens": usage.prompt_tokens if usage else 0,
            "output_tokens": usage.completion_tokens if usage else 0,
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
    Call GPT with strict JSON output enforcement.

    Function name kept as ``call_claude_json`` for backward compatibility.

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
        logger.error("GPT did not return valid JSON: %s", result["content"][:200])
        raise ValueError(
            "GPT failed to return valid JSON. "
            "Raw response (truncated): " + result["content"][:300]
        )

    return parsed
