from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .config import FRONTEND_URL, QUOTA_ENFORCE, TIER_LIMITS, TIER_PRICES_USD
from .tiers import TIER_META
from .database import FactCheck, UsageDaily, User
from .pipeline import is_demo_mode

GUEST_EMAIL = "__guest__@truthnet.local"


def utc_today() -> date:
    return datetime.now(timezone.utc).date()


def next_reset_at() -> datetime:
    """Next UTC midnight."""
    now = datetime.now(timezone.utc)
    tomorrow = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return tomorrow


def effective_tier(user: User) -> str:
    tier = (user.subscription_tier or "free").lower()
    if tier not in TIER_LIMITS:
        tier = "free"

    if user.subscription_status in {"canceled", "past_due"} and user.subscription_period_end:
        if datetime.now(timezone.utc) >= user.subscription_period_end.replace(tzinfo=timezone.utc):
            return "free"

    return tier


def tier_daily_limit(tier: str) -> int:
    return TIER_LIMITS.get(tier, TIER_LIMITS["free"])


def quota_exempt(user: User) -> bool:
    if user.email == GUEST_EMAIL:
        return True
    if is_demo_mode():
        return True
    if not QUOTA_ENFORCE:
        return True
    return False


def _usage_row(db: Session, user_id: int, usage_date: date) -> UsageDaily:
    row = (
        db.query(UsageDaily)
        .filter(UsageDaily.user_id == user_id, UsageDaily.usage_date == usage_date)
        .first()
    )
    if row is None:
        row = UsageDaily(user_id=user_id, usage_date=usage_date, count=0)
        db.add(row)
        db.flush()
    return row


def get_quota(user: User, db: Session) -> dict[str, Any]:
    tier = effective_tier(user)
    limit = tier_daily_limit(tier)
    today = utc_today()

    if quota_exempt(user):
        return {
            "tier": tier,
            "tier_name": TIER_META.get(tier, TIER_META["free"])["name"],
            "limit": limit,
            "used": 0,
            "remaining": limit,
            "resets_at": next_reset_at().isoformat().replace("+00:00", "Z"),
            "subscription_status": user.subscription_status or "active",
            "upgrade_url": f"{FRONTEND_URL}/billing",
            "exempt": True,
        }

    used = _usage_row(db, user.id, today).count
    remaining = max(0, limit - used)

    return {
        "tier": tier,
        "tier_name": TIER_META.get(tier, TIER_META["free"])["name"],
        "limit": limit,
        "used": used,
        "remaining": remaining,
        "resets_at": next_reset_at().isoformat().replace("+00:00", "Z"),
        "subscription_status": user.subscription_status or "active",
        "upgrade_url": f"{FRONTEND_URL}/billing",
        "exempt": False,
        "price_usd": TIER_PRICES_USD.get(tier, 0.0),
    }


def assert_quota_available(user: User, db: Session) -> None:
    if quota_exempt(user):
        return

    quota = get_quota(user, db)
    if quota["remaining"] <= 0:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "quota_exceeded",
                "tier": quota["tier"],
                "limit": quota["limit"],
                "used": quota["used"],
                "remaining": 0,
                "resets_at": quota["resets_at"],
                "upgrade_url": quota["upgrade_url"],
            },
        )


def record_successful_check(user: User, claim: str, payload: dict, db: Session) -> None:
    """Persist verdict and increment daily usage (successful completions only)."""
    if not quota_exempt(user):
        today = utc_today()
        usage = _usage_row(db, user.id, today)
        usage.count += 1

    record = FactCheck(
        user_id=user.id,
        claim_snippet=claim[:500],
        verdict=str(payload.get("verdict", "UNVERIFIABLE")),
        confidence=int(payload.get("confidence_score") or 0),
        status="completed",
        response_json=json.dumps(payload, ensure_ascii=False),
    )
    db.add(record)
    db.commit()


def get_public_tiers() -> list[dict[str, Any]]:
    return [
        {
            "tier": key,
            "name": TIER_META[key]["name"],
            "tagline": TIER_META[key]["tagline"],
            "daily_limit": limit,
            "price_usd": TIER_PRICES_USD[key],
            "price_label": "$0" if key == "free" else f"${TIER_PRICES_USD[key]:.2f}/mo",
            "features": TIER_META[key]["features"],
            "highlight": TIER_META[key]["highlight"],
        }
        for key, limit in TIER_LIMITS.items()
    ]
