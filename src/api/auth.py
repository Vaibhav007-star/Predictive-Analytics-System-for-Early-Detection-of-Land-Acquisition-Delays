"""
Authentication & Authorization Module for SIH26017.
Lightweight, zero-external-dependency HMAC-SHA256 token authentication
with role-based access control (Admin vs Viewer).
"""

import hmac
import hashlib
import base64
import json
import time
from typing import Optional, Dict
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

SECRET_KEY = "sih26017-mord-secret-key-production-demo-token"
ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 86400 * 7  # 7 days for demo ease

class User(BaseModel):
    username: str
    name: str
    role: str  # "Admin" or "Viewer"
    department: str

# Preconfigured authentic demo users
DEMO_USERS: Dict[str, dict] = {
    "admin": {
        "password_hash": hashlib.sha256("sih26017".encode()).hexdigest(),
        "user": User(
            username="admin",
            name="Shri R. K. Sharma",
            role="Admin",
            department="Joint Secretary (Land Resources), MoRD"
        )
    },
    "viewer": {
        "password_hash": hashlib.sha256("viewer123".encode()).hexdigest(),
        "user": User(
            username="viewer",
            name="Dr. Ananya Sen",
            role="Viewer",
            department="Public Infrastructure Audit & Oversight"
        )
    }
}

def b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def b64url_decode(s: str) -> bytes:
    padding = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode((s + padding).encode('utf-8'))

def create_access_token(user: User) -> str:
    """Create signed HMAC-SHA256 JWT-compatible token."""
    header = {"alg": ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": user.username,
        "name": user.name,
        "role": user.role,
        "dept": user.department,
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS
    }
    
    header_enc = b64url_encode(json.dumps(header, separators=(',', ':')).encode())
    payload_enc = b64url_encode(json.dumps(payload, separators=(',', ':')).encode())
    signing_input = f"{header_enc}.{payload_enc}".encode()
    signature = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
    sig_enc = b64url_encode(signature)
    
    return f"{header_enc}.{payload_enc}.{sig_enc}"

def decode_access_token(token: str) -> Optional[dict]:
    """Verify and decode signed token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_enc, payload_enc, sig_enc = parts
        signing_input = f"{header_enc}.{payload_enc}".encode()
        expected_sig = hmac.new(SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        actual_sig = b64url_decode(sig_enc)
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_bytes = b64url_decode(payload_enc)
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        if payload.get("exp", 0) < int(time.time()):
            return None  # Expired
            
        return payload
    except Exception:
        return None

def authenticate_user(username: str, password: str) -> Optional[User]:
    """Authenticate username and password."""
    user_entry = DEMO_USERS.get(username.lower().strip())
    if not user_entry:
        return None
    hashed_pwd = hashlib.sha256(password.encode()).hexdigest()
    if not hmac.compare_digest(user_entry["password_hash"], hashed_pwd):
        return None
    return user_entry["user"]

# FastAPI Security Bearer Scheme
security = HTTPBearer(auto_error=False)

def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Optional[User]:
    """Returns User if valid Bearer token passed, otherwise None."""
    if not auth or not auth.credentials:
        return None
    payload = decode_access_token(auth.credentials)
    if not payload:
        return None
    username = payload.get("sub")
    if username in DEMO_USERS:
        return DEMO_USERS[username]["user"]
    return None

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> User:
    """Enforces authentication: raises 401 if missing or invalid token."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = payload.get("sub")
    if username not in DEMO_USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in authorized system registry.",
        )
    return DEMO_USERS[username]["user"]

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Enforces that the authenticated user possesses Admin role."""
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Requires MoRD Administrative clearance (Admin role)."
        )
    return current_user

