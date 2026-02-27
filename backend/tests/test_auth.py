"""
Test authentication endpoints.
"""

import pytest
from app.models.user import UserRole


def test_register_user(client):
    """Test user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User",
            "role": "agent",
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["full_name"] == "New User"
    assert data["role"] == "agent"
    assert "id" in data


def test_register_duplicate_email(client, test_user):
    """Test registration with existing email."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": test_user.email,
            "password": "password123",
            "full_name": "Duplicate User",
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client, test_user):
    """Test successful login."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"


def test_login_wrong_password(client, test_user):
    """Test login with wrong password."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword",
        }
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Test login with non-existent user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123",
        }
    )
    assert response.status_code == 401


def test_get_current_user(client, auth_headers):
    """Test getting current user info."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"


def test_get_current_user_unauthorized(client):
    """Test getting current user without auth."""
    response = client.get("/api/auth/me")
    assert response.status_code == 403  # HTTPBearer returns 403


def test_update_current_user(client, auth_headers):
    """Test updating current user profile."""
    response = client.put(
        "/api/auth/me",
        headers=auth_headers,
        json={
            "full_name": "Updated Name",
            "phone": "+9876543210",
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["phone"] == "+9876543210"


def test_list_users_as_admin(client, admin_headers, test_user):
    """Test admin can list users."""
    response = client.get("/api/auth/users", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2  # At least admin and test_user


def test_list_users_as_non_admin(client, auth_headers):
    """Test non-admin cannot list users."""
    response = client.get("/api/auth/users", headers=auth_headers)
    assert response.status_code == 403


def test_update_user_as_admin(client, admin_headers, test_user):
    """Test admin can update any user."""
    response = client.put(
        f"/api/auth/users/{test_user.id}",
        headers=admin_headers,
        json={
            "full_name": "Admin Updated Name",
            "role": "viewer",
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Admin Updated Name"
    assert data["role"] == "viewer"


def test_delete_user_as_admin(client, admin_headers, db_session, test_user):
    """Test admin can delete users."""
    response = client.delete(
        f"/api/auth/users/{test_user.id}",
        headers=admin_headers
    )
    assert response.status_code == 204
