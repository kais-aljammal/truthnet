from __future__ import annotations

import os

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()

STRIPE_PRICE_STANDARD = os.getenv("STRIPE_PRICE_STANDARD", "").strip()
STRIPE_PRICE_PRO = os.getenv("STRIPE_PRICE_PRO", "").strip()
STRIPE_PRICE_MAX = os.getenv("STRIPE_PRICE_MAX", "").strip()


def stripe_configured() -> bool:
    return bool(STRIPE_SECRET_KEY)


def webhook_configured() -> bool:
    return bool(STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)


def price_id_for_tier(tier: str) -> str | None:
    mapping = {
        "standard": STRIPE_PRICE_STANDARD,
        "pro": STRIPE_PRICE_PRO,
        "max": STRIPE_PRICE_MAX,
    }
    value = mapping.get(tier, "")
    return value or None


def tier_for_price_id(price_id: str) -> str | None:
    if not price_id:
        return None
    pairs = (
        (STRIPE_PRICE_STANDARD, "standard"),
        (STRIPE_PRICE_PRO, "pro"),
        (STRIPE_PRICE_MAX, "max"),
    )
    for configured, tier in pairs:
        if configured and configured == price_id:
            return tier
    return None
