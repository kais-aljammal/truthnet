from __future__ import annotations

import os

# manual = self-service tier pick (no payment) — default until Stripe is connected
# stripe = Checkout + webhooks only (Phase 2)
BILLING_MODE = os.getenv("BILLING_MODE", "manual").strip().lower()

TIER_LIMITS: dict[str, int] = {
    "free": 3,
    "standard": 15,
    "pro": 30,
    "max": 50,
}

TIER_PRICES_USD: dict[str, float] = {
    "free": 0.0,
    "standard": 19.99,
    "pro": 34.99,
    "max": 49.99,
}

TIER_META: dict[str, dict] = {
    "free": {
        "name": "Free",
        "tagline": "Try the full adversarial pipeline",
        "features": [
            "3 fact-checks per day",
            "4-agent pipeline + SSE",
            "Source citations & confidence score",
            "Manipulation detection",
        ],
        "highlight": False,
    },
    "standard": {
        "name": "Standard",
        "tagline": "For regular fact-checkers",
        "features": [
            "15 fact-checks per day",
            "Everything in Free",
            "Priority queue (soon)",
            "Email support",
        ],
        "highlight": True,
    },
    "pro": {
        "name": "Pro",
        "tagline": "Power users & journalists",
        "features": [
            "30 fact-checks per day",
            "Everything in Standard",
            "Check history",
            "Export verdicts (soon)",
        ],
        "highlight": False,
    },
    "max": {
        "name": "Max",
        "tagline": "Teams & heavy research",
        "features": [
            "50 fact-checks per day",
            "Everything in Pro",
            "API access (soon)",
            "Dedicated support (soon)",
        ],
        "highlight": False,
    },
}
