"""
Growth Copilot API routes.

Endpoints for brand management, strategy generation,
content creation, engagement analysis, and monitoring.
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_db
from app.models.brand_profile import BrandProfile
from app.models.content_piece import ContentPiece
from app.core import memory_manager as memory
from app.agents.orchestrator_agent import run_growth_cycle
from app.agents.engagement_agent import evaluate_content
from app.agents.monitoring_agent import weekly_growth_check
from app.schemas.growth import (
    BrandProfileCreate,
    BrandProfileResponse,
    GrowthCycleRequest,
    GrowthCycleSummary,
    AnalyzeContentRequest,
    ContentAnalysisResponse,
    DashboardMetrics,
    StrategyResponse,
    WeeklyCheckResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/growth", tags=["Growth Copilot"])


# ──────────────────────────────────────────────
# POST /brand-profile
# ──────────────────────────────────────────────

@router.post(
    "/brand-profile",
    response_model=BrandProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a brand profile",
)
async def create_brand_profile(
    payload: BrandProfileCreate,
    db: AsyncSession = Depends(get_async_db),
):
    """Register a new brand to be managed by the growth copilot."""
    brand = BrandProfile(
        name=payload.name,
        niche=payload.niche,
        target_audience=payload.target_audience,
        tone=payload.tone,
        expertise_areas=payload.expertise_areas,
        growth_goal=payload.growth_goal,
    )
    db.add(brand)
    await db.flush()
    await db.refresh(brand)

    logger.info("Brand created id=%d name='%s'", brand.id, brand.name)
    return brand


# ──────────────────────────────────────────────
# POST /run-growth-cycle
# ──────────────────────────────────────────────

@router.post(
    "/run-growth-cycle",
    response_model=GrowthCycleSummary,
    summary="Trigger a full growth cycle for a brand",
)
async def trigger_growth_cycle(
    payload: GrowthCycleRequest,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Run the complete 9-step growth cycle:
    strategy → content → engagement → decisions → memory.
    """
    try:
        result = await run_growth_cycle(payload.brand_id, db)
    except Exception as exc:
        logger.error("Growth cycle failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Growth cycle failed: {exc}",
        )

    if not result.get("success") and "error" in result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"],
        )

    return result


# ──────────────────────────────────────────────
# GET /dashboard-metrics
# ──────────────────────────────────────────────

@router.get(
    "/dashboard-metrics",
    response_model=DashboardMetrics,
    summary="Get aggregated dashboard metrics for a brand",
)
async def get_dashboard_metrics(
    brand_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    """Return high-level metrics for the brand dashboard."""
    # Verify brand exists
    result = await db.execute(
        select(BrandProfile).where(BrandProfile.id == brand_id)
    )
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brand id={brand_id} not found.",
        )

    # Total content count
    count_result = await db.execute(
        select(func.count(ContentPiece.id))
        .where(ContentPiece.brand_id == brand_id)
    )
    total_content = count_result.scalar() or 0

    # Average engagement
    avg_result = await db.execute(
        select(func.avg(ContentPiece.engagement_score))
        .where(ContentPiece.brand_id == brand_id)
    )
    avg_engagement = round(float(avg_result.scalar() or 0), 4)

    # Weekly trend
    weekly_trend = await memory.get_weekly_averages(db, brand_id, weeks=8)

    # Strategy state
    strategy = await memory.get_strategy(db, brand_id)

    return DashboardMetrics(
        brand_id=brand_id,
        brand_name=brand.name,
        total_content=total_content,
        avg_engagement=avg_engagement,
        weekly_trend=weekly_trend,
        strategy_exists=strategy is not None,
        last_strategy_update=strategy["last_updated"] if strategy else None,
    )


# ──────────────────────────────────────────────
# GET /strategy
# ──────────────────────────────────────────────

@router.get(
    "/strategy",
    response_model=StrategyResponse,
    summary="Retrieve current strategy for a brand",
)
async def get_strategy(
    brand_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    """Return the current content pillars and weekly plan."""
    strategy = await memory.get_strategy(db, brand_id)

    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No strategy found for brand id={brand_id}. Run a growth cycle first.",
        )

    return StrategyResponse(
        brand_id=brand_id,
        content_pillars=strategy["content_pillars"],
        weekly_plan=strategy["weekly_plan"],
        last_updated=strategy["last_updated"],
    )


# ──────────────────────────────────────────────
# POST /analyze-content
# ──────────────────────────────────────────────

@router.post(
    "/analyze-content",
    response_model=ContentAnalysisResponse,
    summary="Analyse content engagement and get optimised rewrite",
)
async def analyze_content(
    payload: AnalyzeContentRequest,
):
    """
    Submit content + engagement metrics for AI-powered
    diagnosis, improvement suggestions, and an optimised rewrite.
    """
    metrics = {
        "likes": payload.likes,
        "comments": payload.comments,
        "shares": payload.shares,
    }

    try:
        result = await evaluate_content(payload.content_text, metrics)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Analysis failed — invalid AI response: {exc}",
        )
    except TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=str(exc),
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )

    return result


# ──────────────────────────────────────────────
# POST /simulate-weekly-check
# ──────────────────────────────────────────────

@router.post(
    "/simulate-weekly-check",
    response_model=WeeklyCheckResponse,
    summary="Simulate a weekly monitoring check across all brands",
)
async def simulate_weekly_check(
    db: AsyncSession = Depends(get_async_db),
):
    """
    Run the monitoring agent's weekly growth check.
    Detects decline/stagnation and auto-triggers growth cycles.
    """
    try:
        result = await weekly_growth_check(db)
    except Exception as exc:
        logger.error("Weekly check failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Weekly check failed: {exc}",
        )

    return result
