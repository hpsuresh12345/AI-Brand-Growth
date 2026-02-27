"""
Activity logs API endpoints for audit trail.
"""

import logging
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.user import User, UserRole
from app.schemas.note import ActivityLogResponse
from app.dependencies.auth import get_current_user

# ──────────────────────────────────────────────
# Router Setup
# ──────────────────────────────────────────────

router = APIRouter(prefix="/api/activity-logs", tags=["Activity Logs"])
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────


@router.get("", response_model=List[ActivityLogResponse])
async def list_activity_logs(
    action: Optional[str] = Query(None, description="Filter by action type"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[int] = Query(None, description="Filter by entity ID"),
    days: int = Query(7, ge=1, le=90, description="Number of days to look back"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of logs to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List activity logs with optional filters.
    
    - **action**: Filter by action type (e.g., 'lead_created')
    - **entity_type**: Filter by entity type (e.g., 'lead', 'user')
    - **entity_id**: Filter by specific entity ID
    - **days**: Look back this many days (default: 7)
    - **limit**: Maximum logs to return (default: 100)
    """
    # Build query
    query = db.query(ActivityLog)
    
    # Apply filters
    if action:
        query = query.filter(ActivityLog.action == action)
    if entity_type:
        query = query.filter(ActivityLog.entity_type == entity_type)
    if entity_id is not None:
        query = query.filter(ActivityLog.entity_id == entity_id)
    
    # Date filter
    since = datetime.now(timezone.utc) - timedelta(days=days)
    query = query.filter(ActivityLog.created_at >= since)
    
    # Order and limit
    logs = query.order_by(desc(ActivityLog.created_at)).limit(limit).all()
    
    return logs


@router.get("/user/{user_id}", response_model=List[ActivityLogResponse])
async def list_user_activity_logs(
    user_id: int,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List activity logs for a specific user.
    Only admins can view other users' logs.
    """
    # Authorization check
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only view your own activity logs",
        )
    
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(desc(ActivityLog.created_at))
        .limit(limit)
        .all()
    )
    
    return logs
