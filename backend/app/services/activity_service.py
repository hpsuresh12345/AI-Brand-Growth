"""
Activity logging service for audit trail.
"""

import logging
from typing import Optional, Any
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.user import User

logger = logging.getLogger(__name__)


def log_activity(
    db: Session,
    action: str,
    user: Optional[User] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    description: Optional[str] = None,
    meta_data: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> ActivityLog:
    """
    Create an activity log entry.
    
    Args:
        db: Database session
        action: Action performed (e.g., 'lead_created', 'user_login')
        user: User who performed the action (optional)
        entity_type: Type of entity (e.g., 'lead', 'user')
        entity_id: ID of the entity
        description: Human-readable description
        meta_data: Additional context as dictionary
        ip_address: Client IP address
        user_agent: Client user agent
    
    Returns:
        Created ActivityLog instance
    """
    activity = ActivityLog(
        user_id=user.id if user else None,
        user_email=user.email if user else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
        meta_data=meta_data,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(activity)
    db.commit()
    db.refresh(activity)
    
    logger.info(
        f"Activity logged: {action} by {user.email if user else 'anonymous'} "
        f"on {entity_type}#{entity_id if entity_id else 'N/A'}"
    )
    
    return activity
