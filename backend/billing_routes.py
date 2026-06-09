from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import stripe
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .auth_routes import require_user
from .config import BILLING_MODE, FRONTEND_URL
from .database import FactCheck, UsageDaily, User, get_db
from .quota_service import effective_tier, get_public_tiers, get_quota, tier_daily_limit
from .stripe_config import (
    STRIPE_SECRET_KEY,
    price_id_for_tier,
    stripe_configured,
    webhook_configured,
)
from .tiers import TIER_LIMITS, TIER_META, TIER_PRICES_USD

router = APIRouter(prefix="/api/billing", tags=["billing"])

if stripe_configured():
    stripe.api_key = STRIPE_SECRET_KEY


class SelectTierRequest(BaseModel):
    tier: str = Field(min_length=1, max_length=32)


class CheckoutRequest(BaseModel):
    tier: str = Field(min_length=1, max_length=32)


def _stripe_ready() -> bool:
    return BILLING_MODE == "stripe" and stripe_configured()


def _tier_catalog() -> list[dict[str, Any]]:
    rows = []
    for key in ("free", "standard", "pro", "max"):
        meta = TIER_META[key]
        rows.append({
            "tier": key,
            "name": meta["name"],
            "tagline": meta["tagline"],
            "daily_limit": TIER_LIMITS[key],
            "price_usd": TIER_PRICES_USD[key],
            "price_label": "$0" if key == "free" else f"${TIER_PRICES_USD[key]:.2f}/mo",
            "features": meta["features"],
            "highlight": meta["highlight"],
        })
    return rows


def _usage_history(db: Session, user_id: int, days: int = 7) -> list[dict[str, Any]]:
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=days - 1)
    rows = (
        db.query(UsageDaily)
        .filter(UsageDaily.user_id == user_id, UsageDaily.usage_date >= start)
        .order_by(UsageDaily.usage_date.asc())
        .all()
    )
    by_date = {r.usage_date: r.count for r in rows}
    history = []
    for i in range(days):
        d = start + timedelta(days=i)
        history.append({
            "date": d.isoformat(),
            "count": by_date.get(d, 0),
        })
    return history


@router.get("/status")
def billing_status():
    connected = stripe_configured()
    payments = _stripe_ready()
    return {
        "billing_mode": BILLING_MODE,
        "stripe_connected": connected,
        "stripe_webhook_configured": webhook_configured(),
        "payments_enabled": payments,
        "manual_tier_selection": BILLING_MODE == "manual",
        "message": (
            "Payments not connected — select a plan manually to preview tier limits."
            if BILLING_MODE == "manual"
            else (
                "Stripe checkout is active."
                if payments
                else "Set STRIPE_SECRET_KEY and price IDs to enable checkout."
            )
        ),
    }


@router.get("/plans")
def list_plans():
    return {"plans": _tier_catalog(), "timezone": "UTC"}


@router.get("/me")
def my_billing(user: User = Depends(require_user), db: Session = Depends(get_db)):
    tier = effective_tier(user)
    quota = get_quota(user, db)
    total_checks = db.query(FactCheck).filter(FactCheck.user_id == user.id).count()

    period_end = None
    if user.subscription_period_end:
        period_end = user.subscription_period_end.isoformat().replace("+00:00", "Z")

    return {
        "email": user.email,
        "tier": tier,
        "tier_name": TIER_META.get(tier, TIER_META["free"])["name"],
        "subscription_status": user.subscription_status or "active",
        "subscription_period_end": period_end,
        "stripe_connected": stripe_configured(),
        "billing_mode": BILLING_MODE,
        "quota": quota,
        "usage_history": _usage_history(db, user.id, days=7),
        "lifetime_checks": total_checks,
        "plans": _tier_catalog(),
        "upgrade_url": f"{FRONTEND_URL}/billing",
    }


@router.post("/select-tier")
def select_tier(
    body: SelectTierRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    tier = body.tier.strip().lower()
    if tier not in TIER_LIMITS:
        raise HTTPException(status_code=400, detail=f"Unknown tier: {tier}")

    if BILLING_MODE == "stripe" and tier != "free":
        if _stripe_ready():
            raise HTTPException(
                status_code=501,
                detail={
                    "error": "checkout_required",
                    "message": "Paid tiers require Stripe Checkout.",
                    "upgrade_url": f"{FRONTEND_URL}/billing",
                },
            )
        raise HTTPException(
            status_code=501,
            detail={
                "error": "stripe_not_configured",
                "message": "Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs.",
                "upgrade_url": f"{FRONTEND_URL}/billing",
            },
        )

    if tier != "free" and BILLING_MODE == "manual":
        # Simulated subscription — no charge until Stripe is wired
        user.subscription_tier = tier
        user.subscription_status = "active"
        user.subscription_period_end = datetime.now(timezone.utc) + timedelta(days=30)
    else:
        user.subscription_tier = "free"
        user.subscription_status = "active"
        user.subscription_period_end = None

    db.commit()
    db.refresh(user)

    return {
        "ok": True,
        "tier": effective_tier(user),
        "daily_limit": tier_daily_limit(tier),
        "message": (
            f"Plan updated to {TIER_META[tier]['name']} (preview — no charge until Stripe is connected)."
            if BILLING_MODE == "manual"
            else "Plan updated."
        ),
        "quota": get_quota(user, db),
    }


def _ensure_stripe_customer(user: User, db: Session) -> str:
    if user.stripe_customer_id:
        return user.stripe_customer_id
    customer = stripe.Customer.create(
        email=user.email,
        metadata={"user_id": str(user.id)},
    )
    user.stripe_customer_id = customer.id
    db.commit()
    return customer.id


@router.post("/checkout")
def create_checkout(
    body: CheckoutRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    tier = body.tier.strip().lower()
    if tier not in TIER_LIMITS or tier == "free":
        raise HTTPException(status_code=400, detail=f"Checkout not available for tier: {tier}")

    if not _stripe_ready():
        raise HTTPException(
            status_code=501,
            detail={
                "error": "stripe_not_configured",
                "message": "Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs.",
                "upgrade_url": f"{FRONTEND_URL}/billing",
            },
        )

    price_id = price_id_for_tier(tier)
    if not price_id:
        raise HTTPException(
            status_code=501,
            detail=f"Stripe price ID not configured for tier '{tier}'.",
        )

    customer_id = _ensure_stripe_customer(user, db)
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{FRONTEND_URL}/app?billing=success",
        cancel_url=f"{FRONTEND_URL}/billing?canceled=1",
        metadata={"user_id": str(user.id), "tier": tier},
        subscription_data={"metadata": {"user_id": str(user.id), "tier": tier}},
    )
    return {"url": session.url, "session_id": session.id}


@router.post("/portal")
def create_portal(
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    if not _stripe_ready():
        raise HTTPException(status_code=501, detail="Stripe portal is not configured.")

    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found. Subscribe to a plan first.")

    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=f"{FRONTEND_URL}/billing",
    )
    return {"url": session.url}


# Re-export for main.py compatibility
def get_tiers_public():
    return get_public_tiers()
