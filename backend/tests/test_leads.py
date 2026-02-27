"""
Test lead endpoints.
"""

import pytest
from app.models.lead import Lead


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_create_lead(client, sample_lead_data):
    """Test creating a lead."""
    response = client.post("/api/leads/", json=sample_lead_data)
    assert response.status_code == 201
    data = response.json()
    
    # Check lead data
    assert "lead" in data
    lead = data["lead"]
    assert lead["name"] == sample_lead_data["name"]
    assert lead["phone"] == sample_lead_data["phone"]
    assert lead["budget"] == sample_lead_data["budget"]
    assert "score" in lead
    assert "category" in lead
    
    # Check AI analysis
    assert "ai_analysis" in data
    assert "score_breakdown" in data


def test_create_lead_missing_fields(client):
    """Test creating lead with missing required fields."""
    response = client.post(
        "/api/leads/",
        json={
            "name": "Test Lead",
            # Missing phone, budget, location
        }
    )
    assert response.status_code == 422  # Validation error


def test_list_leads(client, sample_lead_data, db_session):
    """Test listing leads."""
    # Create a test lead
    lead = Lead(
        name=sample_lead_data["name"],
        phone=sample_lead_data["phone"],
        budget=sample_lead_data["budget"],
        location=sample_lead_data["location"],
        score=75,
        category="Warm",
        conversion_probability=0.75,
        no_show_risk=0.25,
    )
    db_session.add(lead)
    db_session.commit()
    
    response = client.get("/api/leads/")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "leads" in data
    assert data["total"] >= 1
    assert isinstance(data["leads"], list)


def test_list_leads_with_category_filter(client, sample_lead_data, db_session):
    """Test listing leads with category filter."""
    # Create test leads with different categories
    for category in ["Hot", "Warm", "Cold"]:
        lead = Lead(
            name=f"{category} Lead",
            phone="+1234567890",
            budget=5000000,
            location="Test Location",
            score=85 if category == "Hot" else 50,
            category=category,
            conversion_probability=0.85 if category == "Hot" else 0.5,
            no_show_risk=0.15,
        )
        db_session.add(lead)
    db_session.commit()
    
    response = client.get("/api/leads/?category=Hot")
    assert response.status_code == 200
    data = response.json()
    assert all(lead["category"] == "Hot" for lead in data["leads"])


def test_get_single_lead(client, sample_lead_data, db_session):
    """Test getting a single lead."""
    lead = Lead(
        name=sample_lead_data["name"],
        phone=sample_lead_data["phone"],
        budget=sample_lead_data["budget"],
        location=sample_lead_data["location"],
        score=75,
        category="Warm",
        conversion_probability=0.75,
        no_show_risk=0.25,
    )
    db_session.add(lead)
    db_session.commit()
    db_session.refresh(lead)
    
    response = client.get(f"/api/leads/{lead.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == lead.id
    assert data["name"] == lead.name


def test_get_nonexistent_lead(client):
    """Test getting a non-existent lead."""
    response = client.get("/api/leads/99999")
    assert response.status_code == 404


def test_search_leads(client, sample_lead_data, db_session):
    """Test advanced lead search."""
    # Create test leads
    leads = [
        Lead(name="Alice Smith", phone="+1111111111", budget=3000000, location="Mumbai", score=80, category="Hot", conversion_probability=0.8, no_show_risk=0.2),
        Lead(name="Bob Jones", phone="+2222222222", budget=7000000, location="Delhi", score=60, category="Warm", conversion_probability=0.6, no_show_risk=0.4),
        Lead(name="Charlie Brown", phone="+3333333333", budget=2000000, location="Mumbai", score=40, category="Cold", conversion_probability=0.4, no_show_risk=0.6),
    ]
    for lead in leads:
        db_session.add(lead)
    db_session.commit()
    
    # Search by name
    response = client.get("/api/leads/search?q=Alice")
    assert response.status_code == 200
    data = response.json()
    assert len(data["leads"]) >= 1
    assert data["leads"][0]["name"] == "Alice Smith"
    
    # Search by location
    response = client.get("/api/leads/search?location=Mumbai")
    assert response.status_code == 200
    data = response.json()
    assert len(data["leads"]) >= 2
    
    # Search by score range
    response = client.get("/api/leads/search?min_score=70")
    assert response.status_code == 200
    data = response.json()
    assert all(lead["score"] >= 70 for lead in data["leads"])


def test_export_leads_csv(client, auth_headers, sample_lead_data, db_session):
    """Test CSV export."""
    # Create test lead
    lead = Lead(
        name=sample_lead_data["name"],
        phone=sample_lead_data["phone"],
        budget=sample_lead_data["budget"],
        location=sample_lead_data["location"],
        score=75,
        category="Warm",
        conversion_probability=0.75,
        no_show_risk=0.25,
    )
    db_session.add(lead)
    db_session.commit()
    
    response = client.get("/api/leads/export/csv", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment" in response.headers["content-disposition"]
    
    # Check CSV content
    content = response.text
    assert "ID,Name,Phone,Budget" in content
    assert sample_lead_data["name"] in content


def test_delete_lead(client, sample_lead_data, db_session):
    """Test deleting a lead."""
    lead = Lead(
        name=sample_lead_data["name"],
        phone=sample_lead_data["phone"],
        budget=sample_lead_data["budget"],
        location=sample_lead_data["location"],
        score=75,
        category="Warm",
        conversion_probability=0.75,
        no_show_risk=0.25,
    )
    db_session.add(lead)
    db_session.commit()
    lead_id = lead.id
    
    response = client.delete(f"/api/leads/{lead_id}")
    assert response.status_code == 204
    
    # Verify deletion
    response = client.get(f"/api/leads/{lead_id}")
    assert response.status_code == 404
