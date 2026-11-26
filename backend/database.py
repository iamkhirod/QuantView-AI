"""
database.py - Persistent SQLite Database & User Store for QuantView AI
Provides user management, role-based access, watchlists, and audit logs.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Database location: backend/data/quantview.db
DB_DIR = Path(__file__).parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "quantview.db"


def get_db_connection() -> sqlite3.Connection:
    """Create a thread-safe connection to SQLite with row dictionary factory."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """
    Cryptographically hash a password using PBKDF2-HMAC-SHA256 with a unique salt.
    Returns (hash_hex, salt_hex).
    """
    if salt is None:
        salt = secrets.token_hex(16)
    
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations=100000
    )
    return dk.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Safely compare candidate password against stored PBKDF2 hash using constant-time comparison."""
    candidate_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(candidate_hash, stored_hash)


def init_db() -> None:
    """Initialize database tables and seed default administrator and demo user accounts."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL COLLATE NOCASE,
                email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                full_name TEXT DEFAULT '',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                last_login TEXT
            );
        """)
        
        # 2. Watchlists table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS watchlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ticker TEXT NOT NULL COLLATE NOCASE,
                company_name TEXT DEFAULT '',
                added_at TEXT NOT NULL,
                notes TEXT DEFAULT '',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE (user_id, ticker)
            );
        """)
        
        # 3. Activity & Audit Logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                action TEXT NOT NULL,
                details TEXT DEFAULT '',
                ip_address TEXT DEFAULT '',
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            );
        """)
        
        conn.commit()

        # Seed default Admin and User if not already existing
        _seed_default_accounts(cursor, conn)


def _seed_default_accounts(cursor: sqlite3.Cursor, conn: sqlite3.Connection) -> None:
    """Seed standard administrator and regular user accounts."""
    now = datetime.now(timezone.utc).isoformat()
    
    # 1. Admin account
    cursor.execute("SELECT id FROM users WHERE username = 'admin' OR email = 'admin@quantview.ai'")
    admin_exists = cursor.fetchone()
    if not admin_exists:
        pwd_hash, salt = hash_password("Admin@123")
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, salt, role, full_name, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        """, ("admin", "admin@quantview.ai", pwd_hash, salt, "admin", "QuantView Administrator", now))
        
    # 2. Standard Demo User
    cursor.execute("SELECT id FROM users WHERE username = 'trader' OR email = 'user@quantview.ai'")
    user_exists = cursor.fetchone()
    if not user_exists:
        pwd_hash, salt = hash_password("User@123")
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, salt, role, full_name, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        """, ("trader", "user@quantview.ai", pwd_hash, salt, "user", "Quantitative Trader", now))

    conn.commit()


# ---------------------------------------------------------------------------
# User Data Access
# ---------------------------------------------------------------------------
def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve user dictionary by ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def get_user_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    """Retrieve user dictionary by username or email."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM users 
            WHERE username = ? OR email = ?
        """, (identifier.strip(), identifier.strip()))
        row = cursor.fetchone()
        return dict(row) if row else None


def create_user(
    username: str,
    email: str,
    password: str,
    full_name: str = "",
    role: str = "user"
) -> Dict[str, Any]:
    """Register a new user in the SQLite database."""
    now = datetime.now(timezone.utc).isoformat()
    pwd_hash, salt = hash_password(password)
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, salt, role, full_name, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        """, (username.strip(), email.strip().lower(), pwd_hash, salt, role, full_name.strip(), now))
        user_id = cursor.lastrowid
        conn.commit()
        
    log_activity(user_id=user_id, username=username, action="USER_REGISTERED", details=f"Registered account role: {role}")
    return get_user_by_id(user_id)  # type: ignore


def update_last_login(user_id: int, ip_address: str = "") -> None:
    """Record last login timestamp for user."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_id))
        conn.commit()
    log_activity(user_id=user_id, action="USER_LOGIN", details="Successful login", ip_address=ip_address)


def update_password(user_id: int, new_password: str) -> bool:
    """Update user password hash and salt."""
    pwd_hash, salt = hash_password(new_password)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users 
            SET password_hash = ?, salt = ?
            WHERE id = ?
        """, (pwd_hash, salt, user_id))
        conn.commit()
    log_activity(user_id=user_id, action="PASSWORD_CHANGE", details="Password updated")
    return True


def list_all_users() -> List[Dict[str, Any]]:
    """List all users for the Admin panel (excluding password hash/salt)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, role, full_name, is_active, created_at, last_login 
            FROM users 
            ORDER BY id ASC
        """)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def toggle_user_status(user_id: int, is_active: bool) -> bool:
    """Enable or disable a user account."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (1 if is_active else 0, user_id))
        conn.commit()
    status_str = "activated" if is_active else "deactivated"
    log_activity(user_id=user_id, action="USER_STATUS_CHANGE", details=f"Account {status_str}")
    return True


def update_user_role(user_id: int, role: str) -> bool:
    """Change user role (e.g., admin or user)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
        conn.commit()
    log_activity(user_id=user_id, action="ROLE_UPDATE", details=f"Role changed to {role}")
    return True


# ---------------------------------------------------------------------------
# Activity & Audit Logging
# ---------------------------------------------------------------------------
def log_activity(
    action: str,
    user_id: Optional[int] = None,
    username: Optional[str] = None,
    details: str = "",
    ip_address: str = ""
) -> None:
    """Record an activity in the audit logs."""
    now = datetime.now(timezone.utc).isoformat()
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if user_id and not username:
                cursor.execute("SELECT username FROM users WHERE id = ?", (user_id,))
                row = cursor.fetchone()
                if row:
                    username = row["username"]
            cursor.execute("""
                INSERT INTO activity_logs (user_id, username, action, details, ip_address, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, username, action, details, ip_address, now))
            conn.commit()
    except Exception:
        pass


def get_recent_activities(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve recent activity logs for admin oversight."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, user_id, username, action, details, ip_address, timestamp
            FROM activity_logs
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
        return [dict(r) for r in cursor.fetchall()]


def get_system_stats() -> Dict[str, Any]:
    """Retrieve administrative metrics and statistics."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS total FROM users")
        total_users = cursor.fetchone()["total"]
        
        cursor.execute("SELECT COUNT(*) AS admins FROM users WHERE role = 'admin'")
        total_admins = cursor.fetchone()["admins"]
        
        cursor.execute("SELECT COUNT(*) AS active FROM users WHERE is_active = 1")
        active_users = cursor.fetchone()["active"]
        
        cursor.execute("SELECT COUNT(*) AS total_activities FROM activity_logs")
        total_activities = cursor.fetchone()["total_activities"]
        
        cursor.execute("SELECT COUNT(*) AS total_watchlists FROM watchlists")
        total_watchlists = cursor.fetchone()["total_watchlists"]
        
    return {
        "total_users": total_users,
        "total_admins": total_admins,
        "active_users": active_users,
        "total_activities": total_activities,
        "total_watchlist_items": total_watchlists,
        "database_engine": "SQLite 3",
        "database_file": str(DB_PATH)
    }


# ---------------------------------------------------------------------------
# Watchlist Persistence
# ---------------------------------------------------------------------------
def get_user_watchlist(user_id: int) -> List[Dict[str, Any]]:
    """Retrieve user's personal watchlist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ticker, company_name, added_at, notes
            FROM watchlists
            WHERE user_id = ?
            ORDER BY id DESC
        """, (user_id,))
        return [dict(r) for r in cursor.fetchall()]


def add_to_user_watchlist(user_id: int, ticker: str, company_name: str = "", notes: str = "") -> bool:
    """Add a ticker to user's saved watchlist."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO watchlists (user_id, ticker, company_name, added_at, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, ticker.strip().upper(), company_name.strip(), now, notes.strip()))
        conn.commit()
    log_activity(user_id=user_id, action="WATCHLIST_ADD", details=f"Added ticker {ticker.upper()}")
    return True


def remove_from_user_watchlist(user_id: int, ticker: str) -> bool:
    """Remove a ticker from user's watchlist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM watchlists
            WHERE user_id = ? AND ticker = ?
        """, (user_id, ticker.strip().upper()))
        conn.commit()
    log_activity(user_id=user_id, action="WATCHLIST_REMOVE", details=f"Removed ticker {ticker.upper()}")
    return True


# Auto-initialize database on module import
init_db()
