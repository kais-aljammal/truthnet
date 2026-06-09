from __future__ import annotations

import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

TRUTHNET_ENV = os.getenv("TRUTHNET_ENV", "development").strip().lower()
IS_PRODUCTION = TRUTHNET_ENV in {"production", "prod"}

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:8000").rstrip("/")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{(PROJECT_ROOT / 'truthnet.db').as_posix()}",
)
# Render/Heroku use postgres:// — SQLAlchemy 2.x expects postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

SESSION_SECRET = os.getenv("SESSION_SECRET", os.getenv("JWT_SECRET", ""))
AUTH_REQUIRED = os.getenv("AUTH_REQUIRED", "true" if IS_PRODUCTION else "false").lower() in {
    "1",
    "true",
    "yes",
}

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))

# Subscription tiers — see backend/tiers.py for limits, prices, and marketing copy
from .tiers import BILLING_MODE, TIER_LIMITS, TIER_META, TIER_PRICES_USD  # noqa: F401
# Legacy flat limit — used only when QUOTA_ENFORCE=false
DAILY_QUOTA_PER_USER = int(os.getenv("DAILY_QUOTA_PER_USER", "20"))
QUOTA_ENFORCE = os.getenv("QUOTA_ENFORCE", "true").lower() in {"1", "true", "yes"}

MAX_CLAIM_CHARS = 8_000
FRONTEND_DIR = PROJECT_ROOT / "frontend"
