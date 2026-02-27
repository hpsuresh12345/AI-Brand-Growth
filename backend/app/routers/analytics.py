"""
Analytics API endpoints.

Provides dashboard metrics, category distribution,
conversion stats, and lead pipeline summary.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.lead import Lead

# ──────────────────────────────────────────────
# Router
# ──────────────────────────────────────────────

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# GET /api/analytics/dashboard
# ──────────────────────────────────────────────


@router.get("/dashboard")
async def dashboard_metrics(db: Session = Depends(get_db)):
    """
    Return aggregated dashboard metrics:
    total leads, category breakdown, averages, and top leads.
    """
    total = db.query(func.count(Lead.id)).scalar() or 0

    if total == 0:
        return {
            "total_leads": 0,
            "categories": {"Hot": 0, "Warm": 0, "Cold": 0},
            "avg_score": 0,
            "avg_conversion_probability": 0.0,
            "avg_no_show_risk": 0.0,
            "top_leads": [],
        }

    # Category counts
    category_rows = (
        db.query(Lead.category, func.count(Lead.id))
        .group_by(Lead.category)
        .all()
    )
    categories = {row[0]: row[1] for row in category_rows}

    # Averages
    avg_score = db.query(func.avg(Lead.score)).scalar() or 0
    avg_conv = db.query(func.avg(Lead.conversion_probability)).scalar() or 0.0
    avg_risk = db.query(func.avg(Lead.no_show_risk)).scalar() or 0.0

    # Top 5 leads by score
    top_leads = (
        db.query(Lead)
        .filter(Lead.score.isnot(None))
        .order_by(Lead.score.desc())
        .limit(5)
        .all()
    )

    return {
        "total_leads": total,
        "categories": {
            "Hot": categories.get("Hot", 0),
            "Warm": categories.get("Warm", 0),
            "Cold": categories.get("Cold", 0),
        },
        "avg_score": round(avg_score),
        "avg_conversion_probability": round(float(avg_conv), 2),
        "avg_no_show_risk": round(float(avg_risk), 2),
        "top_leads": [
            {
                "id": lead.id,
                "name": lead.name,
                "location": lead.location,
                "score": lead.score,
                "category": lead.category,
                "conversion_probability": lead.conversion_probability,
            }
            for lead in top_leads
        ],
    }


# ──────────────────────────────────────────────
# GET /api/analytics/conversion-funnel
# ──────────────────────────────────────────────


@router.get("/conversion-funnel")
async def conversion_funnel(db: Session = Depends(get_db)):
    """
    Return conversion funnel stages with lead counts.
    """
    total = db.query(func.count(Lead.id)).scalar() or 0
    hot = db.query(func.count(Lead.id)).filter(Lead.category == "Hot").scalar() or 0
    high_conv = (
        db.query(func.count(Lead.id))
        .filter(Lead.conversion_probability >= 0.7)
        .scalar() or 0
    )
    low_risk = (
        db.query(func.count(Lead.id))
        .filter(Lead.no_show_risk <= 0.3)
        .scalar() or 0
    )

    return {
        "funnel": [
            {"stage": "Total Leads", "count": total, "percentage": 100},
            {"stage": "Hot Leads", "count": hot,
             "percentage": round((hot / total) * 100) if total else 0},
            {"stage": "High Conversion (≥70%)", "count": high_conv,
             "percentage": round((high_conv / total) * 100) if total else 0},
            {"stage": "Low Risk (≤30%)", "count": low_risk,
             "percentage": round((low_risk / total) * 100) if total else 0},
        ]
    }
