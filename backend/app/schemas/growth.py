"""
Pydantic schemas for Brand Growth Copilot API.

Covers brand profiles, content analysis, growth cycles,
dashboard metrics, and strategy responses.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ══════════════════════════════════════════════
#  Request Schemas
# ══════════════════════════════════════════════

class BrandProfileCreate(BaseModel):
    """Schema for creating a brand profile."""

    name: str = Field(..., min_length=1, max_length=150, examples=["TechVibe AI"])
    niche: str = Field(..., min_length=1, max_length=100, examples=["SaaS"])
    target_audience: str = Field(..., min_length=1, examples=["B2B startup founders"])
    tone: str = Field(..., min_length=1, max_length=100, examples=["Bold & conversational"])
    expertise_areas: Optional[str] = Field(None, examples=["AI, Growth Marketing, Product"])
    growth_goal: Optional[str] = Field(None, examples=["10k LinkedIn followers in 90 days"])

    model_config = {"json_schema_extra": {
        "example": {
            "name": "TechVibe AI",
            "niche": "SaaS",
            "target_audience": "B2B startup founders and tech leaders aged 25-45",
            "tone": "Bold & conversational",
            "expertise_areas": "AI, Growth Marketing, Product-Led Growth",
            "growth_goal": "10k LinkedIn followers in 90 days",
        }
    }}


class GrowthCycleRequest(BaseModel):
    """Schema for triggering a growth cycle."""

    brand_id: int = Field(..., gt=0, examples=[1])


class AnalyzeContentRequest(BaseModel):
    """Schema for content engagement analysis."""

    content_text: str = Field(..., min_length=10, examples=["Your post content here..."])
    likes: int = Field(0, ge=0, examples=[120])
    comments: int = Field(0, ge=0, examples=[35])
    shares: int = Field(0, ge=0, examples=[18])


class StrategyRequest(BaseModel):
    """Query params for strategy retrieval."""

    brand_id: int = Field(..., gt=0, examples=[1])


# ══════════════════════════════════════════════
#  Response Schemas
# ══════════════════════════════════════════════

class BrandProfileResponse(BaseModel):
    """Response after creating a brand profile."""

    id: int
    name: str
    niche: str
    target_audience: str
    tone: str
    expertise_areas: Optional[str] = None
    growth_goal: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class GrowthCycleSummary(BaseModel):
    """Executive summary returned by the growth cycle."""

    success: bool
    brand: dict[str, Any]
    strategy: dict[str, Any]
    content: dict[str, Any]
    engagement: dict[str, Any]
    decisions: dict[str, Any]
    actions_taken: list[str]
    errors: list[str]
    duration_seconds: float
    timestamp: str


class DashboardMetrics(BaseModel):
    """Aggregated dashboard metrics for a brand."""

    brand_id: int
    brand_name: str
    total_content: int
    avg_engagement: float
    weekly_trend: list[float]
    strategy_exists: bool
    last_strategy_update: Optional[str] = None
    recent_alerts: list[dict[str, Any]] = []


class StrategyResponse(BaseModel):
    """Current strategy state for a brand."""

    brand_id: int
    content_pillars: list[Any]
    weekly_plan: list[Any]
    last_updated: Optional[str] = None


class ContentAnalysisResponse(BaseModel):
    """Response from engagement analysis."""

    diagnosis: dict[str, Any]
    overall_score: float
    improvements: list[dict[str, Any]]
    optimised_content: dict[str, Any]
    predicted_lift: str


class WeeklyCheckResponse(BaseModel):
    """Response from the weekly growth check."""

    brands_checked: int
    results: list[dict[str, Any]]
    alerts: list[dict[str, Any]]
    cycles_triggered: int
    timestamp: str
