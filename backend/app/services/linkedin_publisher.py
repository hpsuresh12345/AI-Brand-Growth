"""
LinkedIn Publishing Service.

Posts AI-generated content directly to LinkedIn via the Community Management API.
Requires a LinkedIn Access Token with `w_member_social` permission.

Setup:
1. Create app at https://www.linkedin.com/developers/
2. Request `w_member_social` and `openid` permissions
3. Get an Access Token via OAuth 2.0 3-legged flow
4. Paste token in Brand Profile settings
"""

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

LINKEDIN_API_BASE = "https://api.linkedin.com"


async def get_linkedin_profile(access_token: str) -> dict[str, Any]:
    """
    Fetch the authenticated user's LinkedIn profile (URN + name).
    Used to get the author URN for posting.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{LINKEDIN_API_BASE}/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15,
        )

        if resp.status_code != 200:
            logger.error("LinkedIn profile fetch failed: %d %s", resp.status_code, resp.text)
            raise RuntimeError(f"LinkedIn API error ({resp.status_code}): {resp.text}")

        data = resp.json()
        return {
            "sub": data.get("sub"),  # This is the person URN ID
            "name": data.get("name", "Unknown"),
            "email": data.get("email"),
        }


async def publish_to_linkedin(
    access_token: str,
    text: str,
    *,
    visibility: str = "PUBLIC",
) -> dict[str, Any]:
    """
    Publish a text post to LinkedIn.

    Args:
        access_token: LinkedIn OAuth access token with w_member_social scope.
        text: The post content.
        visibility: PUBLIC or CONNECTIONS.

    Returns:
        dict with publish status and post ID.
    """
    # Step 1: Get author URN
    profile = await get_linkedin_profile(access_token)
    author_urn = f"urn:li:person:{profile['sub']}"

    # Step 2: Create post
    post_body = {
        "author": author_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": visibility,
        },
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LINKEDIN_API_BASE}/v2/ugcPosts",
            json=post_body,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0",
            },
            timeout=30,
        )

        if resp.status_code in (200, 201):
            post_id = resp.headers.get("x-restli-id", resp.json().get("id", "unknown"))
            logger.info("LinkedIn post published: %s", post_id)
            return {
                "success": True,
                "platform": "LinkedIn",
                "post_id": post_id,
                "message": "Post published successfully!",
                "profile_name": profile["name"],
            }
        else:
            logger.error("LinkedIn publish failed: %d %s", resp.status_code, resp.text)
            error_detail = resp.text
            try:
                error_detail = resp.json().get("message", resp.text)
            except Exception:
                pass
            return {
                "success": False,
                "platform": "LinkedIn",
                "post_id": None,
                "message": f"Publish failed ({resp.status_code}): {error_detail}",
            }


async def validate_linkedin_token(access_token: str) -> dict[str, Any]:
    """
    Validate a LinkedIn access token by attempting to fetch the profile.
    Returns profile info if valid, error if not.
    """
    try:
        profile = await get_linkedin_profile(access_token)
        return {
            "valid": True,
            "name": profile["name"],
            "email": profile.get("email"),
        }
    except Exception as exc:
        return {
            "valid": False,
            "error": str(exc),
        }
