"""
Test configuration and fixtures.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.services.auth_service import hash_password, create_access_token

# ──────────────────────────────────────────────
# Test Database Setup
# ──────────────────────────────────────────────

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def engine():
    """Create test database engine."""
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(engine):
    """Create test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """Create test client with override database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ──────────────────────────────────────────────
# User Fixtures
# ──────────────────────────────────────────────

@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    user = User(
        email="test@example.com",
        hashed_password=hash_password("testpassword123"),
        full_name="Test User",
        role=UserRole.AGENT,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session):
    """Create a test admin user."""
    admin = User(
        email="admin@example.com",
        hashed_password=hash_password("adminpassword123"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(test_user):
    """Get authentication headers for test user."""
    token = create_access_token(
        data={
            "user_id": test_user.id,
            "email": test_user.email,
            "role": test_user.role.value,
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin):
    """Get authentication headers for admin user."""
    token = create_access_token(
        data={
            "user_id": test_admin.id,
            "email": test_admin.email,
            "role": test_admin.role.value,
        }
    )
    return {"Authorization": f"Bearer {token}"}


# ──────────────────────────────────────────────
# Lead Fixtures
# ──────────────────────────────────────────────

@pytest.fixture
def sample_lead_data():
    """Sample lead data for testing."""
    return {
        "name": "John Doe",
        "phone": "+1234567890",
        "budget": 5000000,
        "location": "Mumbai",
        "timeline": "Immediately",
        "property_type": "2BHK",
        "loan_status": "Pre-approved",
        "message": "Looking for a 2BHK apartment in Mumbai",
    }
