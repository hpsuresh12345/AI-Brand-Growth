"""
Authentication and user management API endpoints.
"""

import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    Token,
)
from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.dependencies.auth import get_current_user, get_admin_user

# ──────────────────────────────────────────────
# Router Setup
# ──────────────────────────────────────────────

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Public Endpoints
# ──────────────────────────────────────────────


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Note: In production, you may want to restrict registration or require
    admin approval for new accounts.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    db_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"✅ New user registered: {db_user.email} (Role: {db_user.role.value})")
    
    return db_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    # Verify credentials
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact administrator.",
        )
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,
        }
    )
    
    logger.info(f"✅ User logged in: {user.email}")
    
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


# ──────────────────────────────────────────────
# Protected Endpoints
# ──────────────────────────────────────────────


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's information."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile."""
    # Users can only update their own name and phone
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    
    db.commit()
    db.refresh(current_user)
    
    logger.info(f"✅ User updated profile: {current_user.email}")
    
    return current_user


# ──────────────────────────────────────────────
# Admin Endpoints
# ──────────────────────────────────────────────


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """List all users (admin only)."""
    users = db.query(User).all()
    return users


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Update any user's details (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Update fields
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.phone is not None:
        user.phone = user_update.phone
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    
    logger.info(f"✅ Admin {admin_user.email} updated user: {user.email}")
    
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Delete a user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent self-deletion
    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    
    db.delete(user)
    db.commit()
    
    logger.info(f"✅ Admin {admin_user.email} deleted user: {user.email}")
    
    return None
