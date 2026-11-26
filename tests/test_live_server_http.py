"""
test_live_server_http.py - Live HTTP Server & Frontend Verification
Launches uvicorn on localhost:8008, executes end-to-end HTTP requests,
verifies static HTML/CSS/JS asset serving, checks authentication endpoints,
and confirms 100% removal of community/personal attribution links.
"""

import json
import time
import urllib.request
import urllib.error
import threading
import sys
from pathlib import Path

# Add backend to path
ROOT = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(ROOT / "backend"))

import uvicorn
from main import app

TEST_PORT = 8008
BASE_URL = f"http://127.0.0.1:{TEST_PORT}"


def start_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=TEST_PORT, log_level="warning")
    server = uvicorn.Server(config)
    server.run()


def http_get(path, headers=None):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers=headers or {})
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read().decode("utf-8")


def http_post_json(path, data, headers=None):
    payload = json.dumps(data).encode("utf-8")
    hdrs = {"Content-Type": "application/json", **(headers or {})}
    req = urllib.request.Request(f"{BASE_URL}{path}", data=payload, headers=hdrs)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))


def run_server_tests():
    print("=" * 70)
    print("  QUANTVIEW AI — LIVE SERVER & HTTP ENDPOINT VERIFICATION")
    print("=" * 70)

    # Start server in daemon thread
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    time.sleep(2.0)  # Wait for uvicorn to boot

    passed = 0
    total = 0

    def assert_check(cond, desc):
        nonlocal passed, total
        total += 1
        if cond:
            passed += 1
            print(f"  [PASS] {desc}")
        else:
            print(f"  [FAIL] {desc}")
            raise AssertionError(desc)

    # 1. Root / Single Page Application Hosting
    status, body = http_get("/")
    assert_check(status == 200, "GET / serves Single Page Application (HTTP 200)")
    assert_check("QuantView AI" in body, "SPA HTML contains 'QuantView AI' title")
    assert_check("app-root" in body, "SPA HTML mounts #app-root container")

    # Strict Footer Check: Community & Attribution completely removed!
    assert_check("Ashutosh Nayak" not in body, "Ashutosh Nayak attribution completely absent from frontend")
    assert_check("fl-head\">Community" not in body, "Community section completely absent from footer")

    # 2. Static CSS and JS assets
    status, css = http_get("/css/variables.css")
    assert_check(status == 200 and "--primary-accent" in css, "GET /css/variables.css serves design system tokens")

    status, js = http_get("/js/app.js")
    assert_check(status == 200 and "QuantView AI Platform" in js, "GET /js/app.js serves client bootstrapper")

    # 3. Health & Market Status
    status, health_json = http_get("/api/health")
    h_data = json.loads(health_json)
    assert_check(status == 200 and h_data.get("status") == "ok", "GET /api/health reports operational status")

    status, mkt_json = http_get("/api/market-status")
    m_data = json.loads(mkt_json)
    assert_check(status == 200 and "nse" in m_data and "us" in m_data, "GET /api/market-status returns active market status for NSE & US")

    # 4. Admin Authentication
    status, admin_auth = http_post_json("/api/auth/login", {
        "username_or_email": "admin",
        "password": "Admin@123"
    })
    assert_check(status == 200 and "access_token" in admin_auth, "Admin login generates valid access token")
    admin_token = admin_auth["access_token"]
    assert_check(admin_auth["user"]["role"] == "admin", "Admin role confirmed in login payload")

    # 5. User Authentication
    status, user_auth = http_post_json("/api/auth/login", {
        "username_or_email": "trader",
        "password": "User@123"
    })
    assert_check(status == 200 and "access_token" in user_auth, "Trader login generates valid access token")
    user_token = user_auth["access_token"]
    assert_check(user_auth["user"]["role"] == "user", "Standard user role confirmed in login payload")

    # 6. Role-Based Access Control (Admin vs User Endpoints)
    # Admin accesses /api/admin/stats -> HTTP 200
    status, admin_stats = http_get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert_check(status == 200 and "total_users" in admin_stats, "Admin authorized to access /api/admin/stats")

    # Standard User attempts /api/admin/stats -> must be HTTP 403 Forbidden
    threw_403 = False
    try:
        http_get("/api/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    except urllib.error.HTTPError as e:
        if e.code == 403:
            threw_403 = True
    assert_check(threw_403, "Standard User strictly blocked from /api/admin/stats (HTTP 403 Forbidden)")

    # Unauthenticated attempts /api/admin/stats -> must be HTTP 401 Unauthorized
    threw_401 = False
    try:
        http_get("/api/admin/stats")
    except urllib.error.HTTPError as e:
        if e.code == 401:
            threw_401 = True
    assert_check(threw_401, "Unauthenticated request blocked with HTTP 401 Unauthorized")

    # 7. User Watchlist via HTTP
    status, wl_data = http_get("/api/user/watchlist", headers={"Authorization": f"Bearer {user_token}"})
    assert_check(status == 200, "Standard user authorized to access personal watchlist")

    print("\n" + "=" * 70)
    print(f"  ALL {passed}/{total} LIVE HTTP & FRONTEND TESTS PASSED (100%)")
    print("=" * 70)


if __name__ == "__main__":
    run_server_tests()
