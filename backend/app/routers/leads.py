"""
Lead management API endpoints.

Handles lead creation, AI-powered analysis, retrieval,
and listing with full scoring pipeline integration.
"""

import logging
import csv
import io
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.database import get_db
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import (
    LeadCreate,
    LeadResponse,
    LeadAnalysisResponse,
    LeadListResponse,
    AIAnalysis,
    ScoreBreakdown,
    FollowUpResponse,
)
from app.agents.lead_intelligence_agent import analyze_lead
from app.agents.scoring_agent import score_lead
from app.agents.followup_agent import generate_whatsapp_message
from app.agents.no_show_agent import predict_no_show_risk
from app.dependencies.auth import get_current_user, get_optional_user
from app.services.activity_service import log_activity

# ──────────────────────────────────────────────
# Router Setup
# ──────────────────────────────────────────────

router = APIRouter(prefix="/api/leads", tags=["Leads"])
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# POST /api/leads — Create & Analyze Lead
# ──────────────────────────────────────────────


def _fallback_scoring(lead_data: dict) -> dict:
    """Rule-based scoring when AI is unavailable."""
    budget = lead_data.get("budget", 0)
    timeline = lead_data.get("timeline", "")
    loan = lead_data.get("loan_status", "")
    message = lead_data.get("message", "")

    budget_score = min(int((budget / 20_000_000) * 100), 100) if budget else 0
    timeline_map = {"Immediately": 100, "1-3 months": 70, "3-6 months": 40, "6+ months": 15}
    timeline_score = timeline_map.get(timeline, 30)
    loan_map = {"Pre-approved": 100, "Applied": 60, "In progress": 50, "Not started": 10}
    loan_score = loan_map.get(loan, 20)
    message_score = min(len(message) * 2, 100) if message else 0

    final = int(budget_score * 0.25 + timeline_score * 0.25 + loan_score * 0.20 + message_score * 0.10)
    final = min(max(final, 0), 100)

    category = "Hot" if final >= 70 else "Warm" if final >= 40 else "Cold"
    conv = round(final / 100 * 0.9, 2)
    no_show = round(1.0 - conv, 2)

    return {
        "score": final,
        "category": category,
        "conversion_probability": conv,
        "no_show_risk": no_show,
        "score_breakdown": {
            "ai_score": 0,
            "budget_score": budget_score,
            "timeline_score": timeline_score,
            "loan_score": loan_score,
            "message_score": message_score,
        },
    }


@router.post("/", response_model=LeadAnalysisResponse, status_code=201)
async def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """
    Create a new lead, run AI analysis, apply hybrid scoring,
    and return the enriched result.
    """
    lead_dict = lead_in.model_dump()

    # Step 1: AI Intelligence Analysis (graceful fallback if unavailable)
    intelligence = None
    ai_available = True
    try:
        intelligence = await analyze_lead(lead_dict)
    except Exception as exc:
        logger.warning("AI analysis unavailable, using rule-based scoring: %s", exc)
        ai_available = False

    # Step 2: Scoring — hybrid if AI available, rule-based fallback otherwise
    if ai_available and intelligence:
        scoring = score_lead(intelligence_data=intelligence, lead_data=lead_dict)
        no_show = intelligence.get("no_show_risk", 0.0)
    else:
        scoring = _fallback_scoring(lead_dict)
        no_show = scoring.get("no_show_risk", 0.3)

    # Step 3: Persist to database
    db_lead = Lead(
        name=lead_dict["name"],
        phone=lead_dict["phone"],
        budget=lead_dict["budget"],
        location=lead_dict["location"],
        timeline=lead_dict.get("timeline"),
        property_type=lead_dict.get("property_type"),
        loan_status=lead_dict.get("loan_status"),
        message=lead_dict.get("message"),
        score=scoring["score"],
        category=scoring["category"],
        conversion_probability=scoring["conversion_probability"],
        no_show_risk=no_show,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)

    # Log activity
    if current_user:
        log_activity(
            db=db,
            action="lead_created",
            user=current_user,
            entity_type="lead",
            entity_id=db_lead.id,
            description=f"Created lead: {db_lead.name}",
            meta_data={"score": db_lead.score, "category": db_lead.category},
        )

    logger.info("✅  Lead #%d created and scored — %s (AI: %s)", db_lead.id, db_lead.name, ai_available)

    # Step 4: Build response
    if ai_available and intelligence:
        return LeadAnalysisResponse(
            lead=LeadResponse.model_validate(db_lead),
            ai_analysis=AIAnalysis(
                score=intelligence["score"],
                category=intelligence["category"],
                conversion_probability=intelligence["conversion_probability"],
                no_show_risk=intelligence["no_show_risk"],
                summary=intelligence["summary"],
                recommended_action=intelligence["recommended_action"],
            ),
            score_breakdown=ScoreBreakdown(
                ai_score=scoring["score_breakdown"]["ai_score"],
                budget_score=scoring["score_breakdown"]["budget_score"],
                timeline_score=scoring["score_breakdown"]["timeline_score"],
                loan_score=scoring["score_breakdown"]["loan_score"],
                message_score=scoring["score_breakdown"]["message_score"],
            ),
        )
    else:
        return LeadAnalysisResponse(
            lead=LeadResponse.model_validate(db_lead),
            ai_analysis=AIAnalysis(
                score=scoring["score"],
                category=scoring["category"],
                conversion_probability=scoring["conversion_probability"],
                no_show_risk=no_show,
                summary="AI analysis unavailable — scored using rule-based engine.",
                recommended_action="Set up ANTHROPIC_API_KEY for full AI analysis.",
            ),
            score_breakdown=ScoreBreakdown(
                ai_score=0,
                budget_score=scoring["score_breakdown"]["budget_score"],
                timeline_score=scoring["score_breakdown"]["timeline_score"],
                loan_score=scoring["score_breakdown"]["loan_score"],
                message_score=scoring["score_breakdown"]["message_score"],
            ),
        )


# ──────────────────────────────────────────────
# GET /api/leads — List All Leads
# ──────────────────────────────────────────────


@router.get("/", response_model=LeadListResponse)
async def list_leads(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    category: str | None = Query(None, description="Filter by category: Hot, Warm, Cold"),
    db: Session = Depends(get_db),
):
    """Retrieve all leads with optional category filter and pagination."""
    query = db.query(Lead)

    if category:
        query = query.filter(Lead.category == category)

    total = query.count()
    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()

    return LeadListResponse(
        total=total,
        leads=[LeadResponse.model_validate(lead) for lead in leads],
    )


# ──────────────────────────────────────────────
# GET /api/leads/search — Advanced Search
# ──────────────────────────────────────────────


@router.get("/search", response_model=LeadListResponse)
async def search_leads(
    q: str | None = Query(None, description="Search term (name, location, phone)"),
    category: str | None = Query(None, description="Filter by category"),
    min_score: int | None = Query(None, ge=0, le=100, description="Minimum score"),
    max_score: int | None = Query(None, ge=0, le=100, description="Maximum score"),
    location: str | None = Query(None, description="Filter by location"),
    property_type: str | None = Query(None, description="Filter by property type"),
    timeline: str | None = Query(None, description="Filter by timeline"),
    min_budget: int | None = Query(None, ge=0, description="Minimum budget"),
    max_budget: int | None = Query(None, ge=0, description="Maximum budget"),
    sort_by: str = Query("created_at", description="Sort field: created_at, score, name, budget"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Advanced lead search with multiple filters and sorting options.
    
    - **q**: Search term (searches name, location, phone)
    - **category**: Filter by Hot, Warm, or Cold
    - **min_score** / **max_score**: Score range filter
    - **location**: Filter by location (partial match)
    - **property_type**: Filter by property type
    - **timeline**: Filter by timeline
    - **min_budget** / **max_budget**: Budget range filter
    - **sort_by**: Field to sort by (created_at, score, name, budget)
    - **sort_order**: asc or desc
    """
    query = db.query(Lead)
    
    # Text search
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                Lead.name.ilike(search_term),
                Lead.location.ilike(search_term),
                Lead.phone.ilike(search_term),
            )
        )
    
    # Category filter
    if category:
        query = query.filter(Lead.category == category)
    
    # Score range
    if min_score is not None:
        query = query.filter(Lead.score >= min_score)
    if max_score is not None:
        query = query.filter(Lead.score <= max_score)
    
    # Location filter
    if location:
        query = query.filter(Lead.location.ilike(f"%{location}%"))
    
    # Property type filter
    if property_type:
        query = query.filter(Lead.property_type == property_type)
    
    # Timeline filter
    if timeline:
        query = query.filter(Lead.timeline == timeline)
    
    # Budget range
    if min_budget is not None:
        query = query.filter(Lead.budget >= min_budget)
    if max_budget is not None:
        query = query.filter(Lead.budget <= max_budget)
    
    # Sorting
    sort_column = {
        "created_at": Lead.created_at,
        "score": Lead.score,
        "name": Lead.name,
        "budget": Lead.budget,
    }.get(sort_by, Lead.created_at)
    
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
    
    # Count and paginate
    total = query.count()
    leads = query.offset(skip).limit(limit).all()
    
    return LeadListResponse(
        total=total,
        leads=[LeadResponse.model_validate(lead) for lead in leads],
    )


# ──────────────────────────────────────────────
# GET /api/leads/export/csv — Export to CSV
# ──────────────────────────────────────────────


@router.get("/export/csv")
async def export_leads_csv(
    category: str | None = Query(None, description="Filter by category"),
    min_score: int | None = Query(None, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export leads to CSV file with optional filters.
    Requires authentication.
    """
    query = db.query(Lead)
    
    # Apply filters
    if category:
        query = query.filter(Lead.category == category)
    if min_score is not None:
        query = query.filter(Lead.score >= min_score)
    
    leads = query.order_by(Lead.created_at.desc()).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID", "Name", "Phone", "Budget", "Location", "Timeline",
        "Property Type", "Loan Status", "Score", "Category",
        "Conversion Probability", "No Show Risk", "Message", "Created At"
    ])
    
    # Write data rows
    for lead in leads:
        writer.writerow([
            lead.id,
            lead.name,
            lead.phone,
            lead.budget,
            lead.location,
            lead.timeline or "",
            lead.property_type or "",
            lead.loan_status or "",
            lead.score,
            lead.category,
            lead.conversion_probability,
            lead.no_show_risk,
            lead.message or "",
            lead.created_at.strftime("%Y-%m-%d %H:%M:%S") if lead.created_at else "",
        ])
    
    # Log activity
    log_activity(
        db=db,
        action="leads_exported",
        user=current_user,
        entity_type="lead",
        description=f"Exported {len(leads)} leads to CSV",
        meta_data={"count": len(leads), "filters": {"category": category, "min_score": min_score}},
    )
    
    # Prepare response
    output.seek(0)
    filename = f"leads_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ──────────────────────────────────────────────
# GET /api/leads/{id} — Get Single Lead
# ──────────────────────────────────────────────


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """Retrieve a single lead by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with id {lead_id} not found")
    return LeadResponse.model_validate(lead)


# ──────────────────────────────────────────────
# DELETE /api/leads/{id} — Delete Lead
# ──────────────────────────────────────────────


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """Delete a lead by ID."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with id {lead_id} not found")
    db.delete(lead)
    db.commit()
    logger.info("🗑️  Lead #%d deleted", lead_id)


# ──────────────────────────────────────────────
# POST /api/leads/{id}/followup — Generate WhatsApp Message
# ──────────────────────────────────────────────


@router.post("/{lead_id}/followup", response_model=FollowUpResponse)
async def create_followup(lead_id: int, db: Session = Depends(get_db)):
    """
    Generate a personalized WhatsApp follow-up message
    for an existing lead using AI.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with id {lead_id} not found")

    lead_dict = {
        "name": lead.name,
        "phone": lead.phone,
        "budget": lead.budget,
        "location": lead.location,
        "timeline": lead.timeline,
        "property_type": lead.property_type,
        "loan_status": lead.loan_status,
        "message": lead.message,
    }

    category = lead.category or "Warm"

    try:
        whatsapp_msg = await generate_whatsapp_message(lead_dict, category)
    except (ValueError, RuntimeError) as exc:
        logger.error("Follow-up generation failed: %s", exc)
        raise HTTPException(
            status_code=502, detail=f"Follow-up generation failed: {exc}"
        )

    logger.info("💬  Follow-up generated for Lead #%d", lead_id)

    return FollowUpResponse(
        lead_id=lead.id,
        lead_name=lead.name,
        category=category,
        whatsapp_message=whatsapp_msg,
    )


# ──────────────────────────────────────────────
# POST /api/leads/{id}/analyze — Re-Analyze Existing Lead
# ──────────────────────────────────────────────


@router.post("/{lead_id}/analyze", response_model=LeadAnalysisResponse)
async def analyze_existing_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    Re-run the full AI analysis pipeline on an existing lead.

    Calls agents sequentially:
      1. Lead Intelligence Agent  → AI assessment
      2. Scoring Agent            → hybrid score
      3. No-Show Agent            → risk prediction

    Updates all scored fields in the database and returns
    the enriched result.
    """
    # ── Fetch lead ──
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with id {lead_id} not found")

    lead_dict = {
        "name": lead.name,
        "phone": lead.phone,
        "budget": lead.budget,
        "location": lead.location,
        "timeline": lead.timeline,
        "property_type": lead.property_type,
        "loan_status": lead.loan_status,
        "message": lead.message,
    }

    # ── Step 1: AI Intelligence Analysis ──
    logger.info("Step 1/3  Running intelligence analysis for Lead #%d", lead_id)
    try:
        intelligence = await analyze_lead(lead_dict)
    except (ValueError, RuntimeError) as exc:
        logger.error("Intelligence analysis failed for Lead #%d: %s", lead_id, exc)
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}")

    # ── Step 2: Hybrid Scoring ──
    logger.info("Step 2/3  Running hybrid scoring for Lead #%d", lead_id)
    scoring = score_lead(intelligence_data=intelligence, lead_data=lead_dict)

    # ── Step 3: No-Show Risk Prediction ──
    logger.info("Step 3/3  Predicting no-show risk for Lead #%d", lead_id)
    engagement = {
        "response_time": "Unknown",
        "messages_exchanged": 1,
        "site_visits_scheduled": 0,
        "site_visits_completed": 0,
        "last_contact": str(lead.created_at),
        "preferred_contact_time": "Not specified",
    }
    try:
        no_show = await predict_no_show_risk(lead_dict, engagement)
        no_show_value = no_show["risk_percentage"] / 100.0
    except (ValueError, RuntimeError) as exc:
        logger.warning("No-show prediction failed, using AI fallback: %s", exc)
        no_show_value = intelligence.get("no_show_risk", 0.0)

    # ── Persist updated scores ──
    lead.score = scoring["score"]
    lead.category = scoring["category"]
    lead.conversion_probability = scoring["conversion_probability"]
    lead.no_show_risk = no_show_value
    db.commit()
    db.refresh(lead)

    logger.info(
        "Lead #%d re-analyzed — score=%d category=%s",
        lead_id, lead.score, lead.category,
    )

    # ── Build response ──
    return LeadAnalysisResponse(
        lead=LeadResponse.model_validate(lead),
        ai_analysis=AIAnalysis(
            score=intelligence["score"],
            category=intelligence["category"],
            conversion_probability=intelligence["conversion_probability"],
            no_show_risk=no_show_value,
            summary=intelligence["summary"],
            recommended_action=intelligence["recommended_action"],
        ),
        score_breakdown=ScoreBreakdown(
            ai_score=scoring["score_breakdown"]["ai_score"],
            budget_score=scoring["score_breakdown"]["budget_score"],
            timeline_score=scoring["score_breakdown"]["timeline_score"],
            loan_score=scoring["score_breakdown"]["loan_score"],
            message_score=scoring["score_breakdown"]["message_score"],
        ),
    )

# ──────────────────────────────────────────────
# POST /api/leads/{id}/no-show-risk — Predict No-Show
# ──────────────────────────────────────────────


@router.post("/{lead_id}/no-show-risk")
async def predict_lead_no_show(lead_id: int, db: Session = Depends(get_db)):
    """
    Predict the no-show risk for an existing lead
    based on their profile and engagement signals.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Lead with id {lead_id} not found")

    lead_dict = {
        "name": lead.name,
        "phone": lead.phone,
        "budget": lead.budget,
        "location": lead.location,
        "timeline": lead.timeline,
        "property_type": lead.property_type,
        "loan_status": lead.loan_status,
        "message": lead.message,
    }

    # Default engagement metrics (can be extended with real tracking)
    engagement = {
        "response_time": "Within 1 hour",
        "messages_exchanged": 1,
        "site_visits_scheduled": 0,
        "site_visits_completed": 0,
        "last_contact": str(lead.created_at),
        "preferred_contact_time": "Not specified",
    }

    try:
        prediction = await predict_no_show_risk(lead_dict, engagement)
    except (ValueError, RuntimeError) as exc:
        logger.error("No-show prediction failed: %s", exc)
        raise HTTPException(status_code=502, detail=f"No-show prediction failed: {exc}")

    # Update lead's no_show_risk in DB
    lead.no_show_risk = prediction["risk_percentage"] / 100.0
    db.commit()

    logger.info("🔮  No-show risk predicted for Lead #%d: %d%%", lead_id, prediction["risk_percentage"])

    return {
        "lead_id": lead.id,
        "lead_name": lead.name,
        **prediction,
    }
