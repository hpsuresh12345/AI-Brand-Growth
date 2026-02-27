"""
Test notes endpoints.
"""

import pytest
from app.models.lead import Lead
from app.models.note import Note


def test_create_note(client, auth_headers, sample_lead_data, db_session):
    """Test creating a note for a lead."""
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
    
    # Create note
    response = client.post(
        f"/api/leads/{lead.id}/notes",
        headers=auth_headers,
        json={
            "content": "This is a test note",
            "is_important": True,
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "This is a test note"
    assert data["is_important"] is True
    assert data["lead_id"] == lead.id


def test_list_notes(client, auth_headers, sample_lead_data, test_user, db_session):
    """Test listing notes for a lead."""
    # Create lead
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
    
    # Create notes
    notes = [
        Note(lead_id=lead.id, user_id=test_user.id, content="Note 1", is_important=False),
        Note(lead_id=lead.id, user_id=test_user.id, content="Note 2", is_important=True),
    ]
    for note in notes:
        db_session.add(note)
    db_session.commit()
    
    response = client.get(f"/api/leads/{lead.id}/notes", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_update_note(client, auth_headers, sample_lead_data, test_user, db_session):
    """Test updating a note."""
    # Create lead and note
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
    
    note = Note(lead_id=lead.id, user_id=test_user.id, content="Original content", is_important=False)
    db_session.add(note)
    db_session.commit()
    
    # Update note
    response = client.put(
        f"/api/leads/{lead.id}/notes/{note.id}",
        headers=auth_headers,
        json={
            "content": "Updated content",
            "is_important": True,
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Updated content"
    assert data["is_important"] is True


def test_delete_note(client, auth_headers, sample_lead_data, test_user, db_session):
    """Test deleting a note."""
    # Create lead and note
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
    
    note = Note(lead_id=lead.id, user_id=test_user.id, content="To be deleted")
    db_session.add(note)
    db_session.commit()
    note_id = note.id
    
    # Delete note
    response = client.delete(
        f"/api/leads/{lead.id}/notes/{note_id}",
        headers=auth_headers
    )
    assert response.status_code == 204
    
    # Verify deletion
    response = client.get(f"/api/leads/{lead.id}/notes", headers=auth_headers)
    data = response.json()
    assert len(data) == 0
