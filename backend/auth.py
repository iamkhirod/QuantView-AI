"""
auth.py - Secure Cryptographic Authentication, JWT-Style Token Engine & Role Middleware
Supports Admin and Standard User roles with PBKDF2-HMAC-SHA256 and HMAC signed tokens.
"""

from __future__ import annotations

import base64
import hmac
import hashlib
import json
import logging
import os
import time
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

import database as db

log = logging.getLogger(__name__)

# Secret key for HMAC token signing (configurable via environment variable)
AUTH_SECRET_KEY = os.environ.get(
    "QUANTVIEW_SECRET_KEY", 
    "quantview-ai-production-super-secret-key-salt-9876543210"
).encode("utf-8")

# Token lifetime (7 days)
TOKEN_LIFETIME_SECONDS = 7 * 24 * 3600

# Bearer security scheme
security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Cryptographic Token Operations (HMAC-SHA256 Base64 Signed Token)
# ---------------------------------------------------------------------------
def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64_decode(data_str: str) -> bytes:
    padding = "=" * ((4 - len(data_str) % 4) % 4)
    return base64.urlsafe_b64decode(data_str + padding)


def create_access_token(user_id: int, username: str, email: str, role: str) -> str:
    """Generate a tamper-proof cryptographically signed access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "username": username,
        "email": email,
        "role": role,
        "exp": int(time.time()) + TOKEN_LIFETIME_SECONDS,
        "iat": int(time.time()),
    }
    
    header_b64 = _b64_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    
    signature = hmac.new(AUTH_SECRET_KEY, signing_input, hashlib.sha256).digest()
    sig_b64 = _b64_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify cryptographic signature and expiration of an access token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(AUTH_SECRET_KEY, signing_input, hashlib.sha256).digest()
        actual_sig = _b64_decode(sig_b64)
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            log.warning("Invalid token HMAC signature")
            return None
        
        payload = json.loads(_b64_decode(payload_b64).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            log.info("Expired access token presented")
            return None
            
        return payload
    except Exception as exc:
        log.warning("Token verification error: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    role: str
    full_name: Optional[str] = ""
    is_active: bool = True
    created_at: str
    last_login: Optional[str] = None


class LoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Username or email address")
    password: str = Field(..., min_length=1, description="Account password")


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_\-]+$")
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = Field("", max_length=100)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserProfile


class UserStatusRequest(BaseModel):
    is_active: bool


class UserRoleRequest(BaseModel):
    role: str = Field(..., pattern=r"^(admin|user)$")


class WatchlistAddRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=25)
    company_name: Optional[str] = ""
    notes: Optional[str] = ""


# ---------------------------------------------------------------------------
# FastAPI Authentication Dependencies
# ---------------------------------------------------------------------------
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    request: Request = None,  # type: ignore
) -> Dict[str, Any]:
    """
    Extract and validate bearer token from Authorization header or cookie.
    Retrieves full user record from the SQLite database.
    """
    token: Optional[str] = None
    if credentials:
        token = credentials.credentials
    elif request and "Authorization" in request.headers:
        auth_hdr = request.headers["Authorization"]
        if auth_hdr.startswith("Bearer "):
            token = auth_hdr[7:].strip()
    elif request and "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id")
    user = db.get_user_by_id(int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended. Please contact administrator.",
        )

    return user


async def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Strictly enforce Administrator role on protected endpoints."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required.",
        )
    return current_user


async def optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    request: Request = None,  # type: ignore
) -> Optional[Dict[str, Any]]:
    """Return user if authenticated, otherwise return None without error."""
    try:
        return await get_current_user(credentials, request)
    except Exception:
        return None
