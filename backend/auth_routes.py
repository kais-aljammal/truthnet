from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from .auth_utils import hash_password, verify_password
from .config import AUTH_REQUIRED, TIER_LIMITS
from .database import User, get_db
from .quota_service import effective_tier

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if value.isdigit() or value.isalpha():
            raise ValueError("Password must include both letters and numbers.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserPublic(BaseModel):
    id: int
    email: str


def _session_user_id(request: Request) -> Optional[int]:
    raw = request.session.get("user_id")
    if raw is None:
        return None
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[User]:
    user_id = _session_user_id(request)
    if user_id is None:
        return None
    return db.get(User, user_id)


def require_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    if not AUTH_REQUIRED:
        guest = db.query(User).filter(User.email == "__guest__@truthnet.local").first()
        if guest is None:
            guest = User(email="__guest__@truthnet.local", password_hash="!")
            db.add(guest)
            db.commit()
            db.refresh(guest)
        return guest

    user = get_current_user(request, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )
    if user.email == "__guest__@truthnet.local":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in.")
    return user


@router.get("/config")
def auth_config() -> dict:
    return {
        "auth_required": AUTH_REQUIRED,
        "tier_limits": TIER_LIMITS,
        "quota_timezone": "UTC",
    }


@router.post("/register", response_model=UserPublic)
def register(body: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    request.session["user_id"] = user.id
    return UserPublic(id=user.id, email=user.email)


@router.post("/login", response_model=UserPublic)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    request.session["user_id"] = user.id
    return UserPublic(id=user.id, email=user.email)


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    if user is None or user.email == "__guest__@truthnet.local":
        return {"authenticated": False, "user": None}
    return {
        "authenticated": True,
        "user": {
            **UserPublic(id=user.id, email=user.email).model_dump(),
            "tier": effective_tier(user),
        },
    }
