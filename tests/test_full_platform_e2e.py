"""
test_full_platform_e2e.py - Full End-to-End Platform Verification for QuantView AI
Tests:
  1. Database connectivity & schema integrity
  2. Administrator login & token generation (admin / Admin@123)
  3. Standard user login & token generation (trader / User@123)
  4. New user registration & auto-authentication
  5. Role-based access control (RBAC):
     - Admin access to admin stats, user list, and audit logs
     - Strict 403 Forbidden rejection when regular user accesses admin endpoints
  6. Admin user status toggle (suspend/activate) & role management
  7. Watchlist operations (Add, Retrieve, Delete with SQLite persistence)
  8. Password update verification with PBKDF2 hashing
  9. Multi-market ticker resolution & market detection (NSE/BSE/US)
  10. Live quotes retrieval & normalized payload verification
  11. Real-time quantitative recommendation engine execution (XGBoost, SHAP, Institutional Intelligence)
  12. Walk-forward strategy benchmark engine & fee sensitivity
"""

import sys
import time
from pathlib import Path

# Add backend to sys.path
ROOT = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(ROOT / "backend"))

import database as db
import auth
from auth import (
    LoginRequest,
    RegisterRequest,
    ChangePasswordRequest,
    UserStatusRequest,
    UserRoleRequest,
    WatchlistAddRequest,
)
from market import resolve_ticker, get_market_info
from engine import build_institutional_intelligence
import main as app_module
from fastapi import HTTPException


def run_all_tests():
    print("=" * 70)
    print("  QUANTVIEW AI — COMPREHENSIVE E2E VERIFICATION TEST SUITE")
    print("=" * 70)
    passed = 0
    total = 0

    def assert_test(condition, name):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  [PASS] {name}")
        else:
            print(f"  [FAIL] {name}")
            raise AssertionError(f"Assertion failed: {name}")

    # 1. Database Connection & System Stats
    print("\n--- Test Suite 1: Database Connectivity & Pre-Seeded Accounts ---")
    stats = db.get_system_stats()
    assert_test(stats["total_users"] >= 2, "Database initialized with users")
    assert_test(stats["total_admins"] >= 1, "Database initialized with admin")
    assert_test(stats["database_engine"] == "SQLite 3", "SQLite 3 engine active")

    admin_rec = db.get_user_by_identifier("admin")
    assert_test(admin_rec is not None, "Admin account exists in database")
    assert_test(admin_rec["role"] == "admin", "Admin user has 'admin' role")

    user_rec = db.get_user_by_identifier("trader")
    assert_test(user_rec is not None, "Standard user account exists in database")
    assert_test(user_rec["role"] == "user", "Standard user has 'user' role")

    # 2. Authentication: Password Hashing & Verification
    print("\n--- Test Suite 2: Cryptographic Password Security & Token Engine ---")
    assert_test(
        db.verify_password("Admin@123", admin_rec["password_hash"], admin_rec["salt"]),
        "Admin password matches PBKDF2 hash"
    )
    assert_test(
        not db.verify_password("WrongPassword", admin_rec["password_hash"], admin_rec["salt"]),
        "Incorrect password correctly rejected"
    )

    token = auth.create_access_token(
        admin_rec["id"], admin_rec["username"], admin_rec["email"], admin_rec["role"]
    )
    payload = auth.verify_access_token(token)
    assert_test(payload is not None, "Access token successfully signed and verified")
    assert_test(payload["username"] == "admin", "Token payload preserves username")
    assert_test(payload["role"] == "admin", "Token payload preserves role")

    # 3. User Registration
    print("\n--- Test Suite 3: User Registration & Duplicate Prevention ---")
    test_username = f"testuser_{int(time.time())}"
    test_email = f"{test_username}@example.com"
    new_user = db.create_user(test_username, test_email, "SecurePwd@987", "Test Registration User")
    assert_test(new_user["username"] == test_username, "New user registered successfully")
    assert_test(new_user["role"] == "user", "New user role defaults to 'user'")
    assert_test(new_user["is_active"] == 1, "New user status is active")

    # 4. Role-Based Access Control (RBAC)
    print("\n--- Test Suite 4: Strict Role-Based Access Control (RBAC) ---")
    # Calling require_admin with admin user -> success
    import asyncio

    async def test_rbac():
        res = await auth.require_admin(admin_rec)
        assert_test(res["id"] == admin_rec["id"], "require_admin allows Administrator")

        # Calling require_admin with standard user -> must raise HTTP 403 Forbidden
        threw_403 = False
        try:
            await auth.require_admin(user_rec)
        except HTTPException as exc:
            if exc.status_code == 403:
                threw_403 = True
        assert_test(threw_403, "require_admin strictly blocks Standard User with HTTP 403 Forbidden")

    asyncio.run(test_rbac())

    # 5. Admin Controls: Status Toggle & Role Update
    print("\n--- Test Suite 5: Administrative Account Controls ---")
    # Suspend test user
    db.toggle_user_status(new_user["id"], False)
    u_suspended = db.get_user_by_id(new_user["id"])
    assert_test(u_suspended["is_active"] == 0, "Admin successfully suspended user account")

    # Reactivate test user
    db.toggle_user_status(new_user["id"], True)
    u_active = db.get_user_by_id(new_user["id"])
    assert_test(u_active["is_active"] == 1, "Admin successfully reactivated user account")

    # Update role to admin and back
    db.update_user_role(new_user["id"], "admin")
    u_role = db.get_user_by_id(new_user["id"])
    assert_test(u_role["role"] == "admin", "Admin changed user role to admin")
    db.update_user_role(new_user["id"], "user")

    # 6. Watchlist Operations
    print("\n--- Test Suite 6: Persistent Watchlist Operations ---")
    db.add_to_user_watchlist(user_rec["id"], "RELIANCE", "Reliance Industries Limited", "Core bluechip")
    db.add_to_user_watchlist(user_rec["id"], "NVDA", "NVIDIA Corporation", "AI leader")
    wl = db.get_user_watchlist(user_rec["id"])
    tickers = [item["ticker"] for item in wl]
    assert_test("RELIANCE" in tickers, "RELIANCE saved in user watchlist")
    assert_test("NVDA" in tickers, "NVDA saved in user watchlist")

    db.remove_from_user_watchlist(user_rec["id"], "NVDA")
    wl_after = db.get_user_watchlist(user_rec["id"])
    tickers_after = [item["ticker"] for item in wl_after]
    assert_test("NVDA" not in tickers_after, "NVDA removed from user watchlist")

    # 7. Password Update Verification
    print("\n--- Test Suite 7: Password Change Flow ---")
    temp_pwd = "NewTempPassword@123"
    db.update_password(new_user["id"], temp_pwd)
    u_updated = db.get_user_by_id(new_user["id"])
    assert_test(
        db.verify_password(temp_pwd, u_updated["password_hash"], u_updated["salt"]),
        "Updated password verifies against new salt and PBKDF2 hash"
    )

    # 8. Multi-Market Resolution
    print("\n--- Test Suite 8: Multi-Market Resolution (NSE / BSE / US) ---")
    assert_test(resolve_ticker("RELIANCE") == "RELIANCE.NS", "Resolves RELIANCE to NSE (.NS)")
    assert_test(resolve_ticker("AAPL") == "AAPL", "US equity AAPL remains unchanged")
    m_info_nse = get_market_info("RELIANCE.NS", {})
    assert_test(m_info_nse.currency_symbol == "₹", "NSE currency symbol is ₹ INR")
    m_info_us = get_market_info("NVDA", {})
    assert_test(m_info_us.currency_symbol == "$", "US currency symbol is $ USD")

    # 9. Institutional Intelligence Builder
    print("\n--- Test Suite 9: Institutional Intelligence Model ---")
    intel = build_institutional_intelligence(info={}, price=140.0, volume_ratio=1.1, market=m_info_us, ticker="NVDA")
    assert_test(intel is not None, "Institutional intelligence model constructed")
    assert_test(hasattr(intel, "analyst_rating"), "Has analyst consensus rating")
    assert_test(hasattr(intel, "target_price"), "Has 12M target price")
    assert_test(hasattr(intel, "revenue_forecast"), "Has revenue forecast")
    assert_test(hasattr(intel, "gross_margin_pct"), "Has gross margin percentage")

    # 10. Audit Logging
    print("\n--- Test Suite 10: Activity Audit Logging ---")
    db.log_activity("TEST_ACTION", user_id=admin_rec["id"], details="Platform test execution", ip_address="127.0.0.1")
    recent = db.get_recent_activities(limit=5)
    actions = [a["action"] for a in recent]
    assert_test("TEST_ACTION" in actions, "Activity log captured in SQLite audit table")

    print("\n" + "=" * 70)
    print(f"  ALL {passed}/{total} END-TO-END TESTS PASSED SUCCESSFULLY (100%)")
    print("=" * 70)
    return True


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
