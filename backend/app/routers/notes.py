"""
Notes API endpoints for lead comments and notes.
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.note import Note
from app.models.lead import Lead
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.dependencies.auth import get_current_user
from app.services.activity_service import log_activity

# ──────────────────────────────────────────────
# Router Setup
# ──────────────────────────────────────────────

router = APIRouter(prefix="/api/leads/{lead_id}/notes", tags=["Notes"])
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────


@router.get("", response_model=List[NoteResponse])
async def list_notes(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all notes for a lead."""
    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )
    
    notes = db.query(Note).filter(Note.lead_id == lead_id).order_by(Note.created_at.desc()).all()
    return notes


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    lead_id: int,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new note for a lead."""
    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found",
        )
    
    # Create note
    db_note = Note(
        lead_id=lead_id,
        user_id=current_user.id,
        content=note_in.content,
        is_important=note_in.is_important,
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # Log activity
    log_activity(
        db=db,
        action="note_created",
        user=current_user,
        entity_type="note",
        entity_id=db_note.id,
        description=f"Added note to lead #{lead_id}",
        meta_data={"lead_id": lead_id, "lead_name": lead.name},
    )
    
    logger.info(f"✅ Note #{db_note.id} created for lead #{lead_id} by {current_user.email}")
    
    return db_note


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    lead_id: int,
    note_id: int,
    note_update: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a note."""
    note = db.query(Note).filter(Note.id == note_id, Note.lead_id == lead_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    
    # Update fields
    if note_update.content is not None:
        note.content = note_update.content
    if note_update.is_important is not None:
        note.is_important = note_update.is_important
    
    db.commit()
    db.refresh(note)
    
    # Log activity
    log_activity(
        db=db,
        action="note_updated",
        user=current_user,
        entity_type="note",
        entity_id=note.id,
        description=f"Updated note #{note_id}",
    )
    
    logger.info(f"✅ Note #{note_id} updated by {current_user.email}")
    
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    lead_id: int,
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a note."""
    note = db.query(Note).filter(Note.id == note_id, Note.lead_id == lead_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    
    db.delete(note)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        action="note_deleted",
        user=current_user,
        entity_type="note",
        entity_id=note_id,
        description=f"Deleted note #{note_id}",
    )
    
    logger.info(f"✅ Note #{note_id} deleted by {current_user.email}")
    
    return None
