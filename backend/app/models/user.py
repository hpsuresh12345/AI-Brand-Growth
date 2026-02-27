"""
User model for authentication and authorization.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    AGENT = "agent"
    VIEWER = "viewer"


class User(Base):
    """SQLAlchemy model for users."""

    __tablename__ = "users"

    # ── Primary Key ──────────────────────────────
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # ── Authentication ───────────────────────────
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # ── Profile ───────────────────────────────────
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    
    # ── Authorization ─────────────────────────────
    role = Column(Enum(UserRole), default=UserRole.AGENT, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # ── Metadata ──────────────────────────────────
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    last_login = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"
