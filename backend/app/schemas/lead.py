"""
Pydantic schemas for Lead request/response validation.

Separates API contracts from database models to keep
the interface stable even if the ORM layer changes.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Request Schemas (Client → API)
# ──────────────────────────────────────────────


class LeadCreate(BaseModel):
    """Schema for creating a new lead."""

    name: str = Field(..., min_length=1, max_length=100, examples=["Rahul Sharma"])
    phone: str = Field(..., min_length=5, max_length=20, examples=["9876543210"])
    budget: int = Field(..., gt=0, examples=[5000000])
    location: str = Field(..., min_length=1, max_length=200, examples=["Whitefield, Bangalore"])
    timeline: Optional[str] = Field(None, max_length=50, examples=["1-3 months"])
    property_type: Optional[str] = Field(None, max_length=50, examples=["2BHK"])
    loan_status: Optional[str] = Field(None, max_length=50, examples=["Pre-approved"])
    message: Optional[str] = Field(None, examples=["Looking for a 2BHK near IT park"])

    model_config = {"json_schema_extra": {
        "example": {
            "name": "Rahul Sharma",
            "phone": "9876543210",
            "budget": 5000000,
            "location": "Whitefield, Bangalore",
            "timeline": "1-3 months",
            "property_type": "2BHK",
            "loan_status": "Pre-approved",
            "message": "Looking for a 2BHK apartment near the IT park with good amenities.",
        }
    }}


# ──────────────────────────────────────────────
# Response Schemas (API → Client)
# ──────────────────────────────────────────────


class ScoreBreakdown(BaseModel):
    """Transparent breakdown of how the lead was scored."""

    ai_score: int
    budget_score: int
    timeline_score: int
    loan_score: int
    message_score: int


class AIAnalysis(BaseModel):
    """AI intelligence output for a lead."""

    score: int
    category: str
    conversion_probability: float
    no_show_risk: float
    summary: str
    recommended_action: str


class LeadResponse(BaseModel):
    """Full lead response with AI scoring data."""

    id: int
    name: str
    phone: str
    budget: int
    location: str
    timeline: Optional[str] = None
    property_type: Optional[str] = None
    loan_status: Optional[str] = None
    message: Optional[str] = None
    score: Optional[int] = None
    category: Optional[str] = None
    conversion_probability: Optional[float] = None
    no_show_risk: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadAnalysisResponse(BaseModel):
    """Response returned after AI analysis of a lead."""

    lead: LeadResponse
    ai_analysis: AIAnalysis
    score_breakdown: ScoreBreakdown


class LeadListResponse(BaseModel):
    """Paginated list of leads."""

    total: int
    leads: list[LeadResponse]


class FollowUpResponse(BaseModel):
    """Response for WhatsApp follow-up message generation."""

    lead_id: int
    lead_name: str
    category: str
    whatsapp_message: str
