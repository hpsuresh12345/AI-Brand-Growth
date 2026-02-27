"""
Test analytics endpoints.
"""

import pytest
from app.models.lead import Lead


def test_dashboard_metrics_empty(client):
    """Test dashboard with no leads."""
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["total_leads"] == 0
    assert data["avg_score"] == 0


def test_dashboard_metrics_with_leads(client, db_session):
    """Test dashboard metrics with leads."""
    # Create test leads
    leads = [
        Lead(name="Lead 1", phone="+1111", budget=5000000, location="Mumbai", score=90, category="Hot", conversion_probability=0.9, no_show_risk=0.1),
        Lead(name="Lead 2", phone="+2222", budget=3000000, location="Delhi", score=60, category="Warm", conversion_probability=0.6, no_show_risk=0.4),
        Lead(name="Lead 3", phone="+3333", budget=2000000, location="Pune", score=30, category="Cold", conversion_probability=0.3, no_show_risk=0.7),
    ]
    for lead in leads:
        db_session.add(lead)
    db_session.commit()
    
    response = client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_leads"] == 3
    assert data["categories"]["Hot"] == 1
    assert data["categories"]["Warm"] == 1
    assert data["categories"]["Cold"] == 1
    assert data["avg_score"] > 0
    assert len(data["top_leads"]) <= 5


def test_conversion_funnel(client, db_session):
    """Test conversion funnel endpoint."""
    # Create test leads
    for i, category in enumerate(["Hot", "Warm", "Cold", "Hot"]):
        lead = Lead(
            name=f"Lead {i}",
            phone=f"+{1111+i}",
            budget=5000000,
            location="Test",
            score=90 - (i * 20),
            category=category,
            conversion_probability=0.9 - (i * 0.2),
            no_show_risk=0.1 + (i * 0.2),
        )
        db_session.add(lead)
    db_session.commit()
    
    response = client.get("/api/analytics/conversion-funnel")
    assert response.status_code == 200
    data = response.json()
    
    assert "total_leads" in data
    assert "hot_leads" in data
    assert "warm_leads" in data
    assert "cold_leads" in data
