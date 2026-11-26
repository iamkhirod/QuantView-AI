"""
test_auth_admin.py - Unit and Integration Tests for QuantView Authentication & Admin RBAC
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend modules can be imported
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

import database as db
import auth
from main import app

client = TestClient(app)


def test_db_seeded_accounts():
    """Verify default Admin and Standard User accounts are seeded and functional."""
    admin = db.get_user_by_identifier("admin")
    assert admin is not None
    assert admin["role"] == "admin"
    assert db.verify_password("Admin@123", admin["password_hash"], admin["salt"]) is True

    user = db.get_user_by_identifier("trader")
    assert user is not None
    assert user["role"] == "user"
    assert db.verify_password("User@123", user["password_hash"], user["salt"]) is True


def test_admin_login_success():
    """Admin login must return valid token and admin role."""
    resp = client.post("/api/auth/login", json={
        "username_or_email": "admin",
        "password": "Admin@123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["username"] == "admin"


def test_user_login_success():
    """Normal user login must return valid token and user role."""
    resp = client.post("/api/auth/login", json={
        "username_or_email": "trader",
        "password": "User@123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "user"


def test_invalid_login_rejected():
    """Invalid credentials must return 401 Unauthorized."""
    resp = client.post("/api/auth/login", json={
        "username_or_email": "admin",
        "password": "WrongPassword!999"
    })
    assert resp.status_code == 401


def test_user_registration():
    """New user registration must succeed and persist to database."""
    username = "test_trader_01"
    email = "trader01@quantview.ai"
    resp = client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "password": "StrongPassword!456",
        "full_name": "Test Trader"
    })
    # Either 200 created or already existing
    assert resp.status_code in (200, 400)
    if resp.status_code == 200:
        data = resp.json()
        assert data["user"]["username"] == username
        assert data["user"]["role"] == "user"


def test_rbac_admin_endpoint_forbidden_for_normal_user():
    """Normal users must be denied access to Admin-only endpoints (403 Forbidden)."""
    # 1. Login as normal user
    login_resp = client.post("/api/auth/login", json={
        "username_or_email": "trader",
        "password": "User@123"
    })
    user_token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {user_token}"}

    # 2. Attempt to access admin routes
    users_resp = client.get("/api/admin/users", headers=headers)
    assert users_resp.status_code == 403

    stats_resp = client.get("/api/admin/stats", headers=headers)
    assert stats_resp.status_code == 403


def test_rbac_admin_endpoint_allowed_for_admin():
    """Admin must have full access to Admin endpoints (200 OK)."""
    # 1. Login as Admin
    login_resp = client.post("/api/auth/login", json={
        "username_or_email": "admin",
        "password": "Admin@123"
    })
    admin_token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Access admin users list
    users_resp = client.get("/api/admin/users", headers=headers)
    assert users_resp.status_code == 200
    users = users_resp.json()
    assert isinstance(users, list)
    assert any(u["username"] == "admin" for u in users)

    # 3. Access admin stats
    stats_resp = client.get("/api/admin/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "total_users" in stats
    assert "active_users" in stats


def test_user_watchlist_persistence():
    """Users can save, retrieve, and delete items from their personal watchlist."""
    login_resp = client.post("/api/auth/login", json={
        "username_or_email": "trader",
        "password": "User@123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add NVDA to watchlist
    add_resp = client.post("/api/user/watchlist", json={
        "ticker": "NVDA",
        "company_name": "Nvidia Corp",
        "notes": "Leading AI semiconductor"
    }, headers=headers)
    assert add_resp.status_code == 200

    # Get watchlist
    get_resp = client.get("/api/user/watchlist", headers=headers)
    assert get_resp.status_code == 200
    watchlist = get_resp.json()
    assert any(item["ticker"] == "NVDA" for item in watchlist)

    # Remove NVDA
    del_resp = client.delete("/api/user/watchlist/NVDA", headers=headers)
    assert del_resp.status_code == 200
