"""Smoke-test tiers, quota, billing, and history APIs (no live Stripe charge).

Run from repo root:
  .\\.venv\\Scripts\\python scripts\\test_tiers_api.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / ".env", override=False)

os.environ["AUTH_REQUIRED"] = "true"
os.environ["QUOTA_ENFORCE"] = "true"
os.environ["BILLING_MODE"] = "manual"
os.environ["DEMO_MODE"] = "false"

from fastapi.testclient import TestClient  # noqa: E402

from backend.database import SessionLocal, User, init_db  # noqa: E402
from backend.main import app  # noqa: E402

TEST_EMAIL = "tier-test@example.com"


def main() -> int:
    init_db()
    db = SessionLocal()
    user = db.query(User).filter(User.email == TEST_EMAIL).first()
    if user is None:
        from backend.auth_utils import hash_password

        user = User(email=TEST_EMAIL, password_hash=hash_password("testpass1"))
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()

    client = TestClient(app)
    login = client.post("/auth/login", json={"email": TEST_EMAIL, "password": "testpass1"})
    if login.status_code != 200:
        reg = client.post("/auth/register", json={"email": TEST_EMAIL, "password": "testpass1"})
        if reg.status_code not in (200, 400):
            print(f"[FAIL] register/login: {reg.status_code} {reg.text}")
            return 1
        login = client.post("/auth/login", json={"email": TEST_EMAIL, "password": "testpass1"})
    assert login.status_code == 200, login.text

    checks = [
        ("GET /api/tiers", lambda: client.get("/api/tiers")),
        ("GET /api/billing/status", lambda: client.get("/api/billing/status")),
        ("GET /api/billing/plans", lambda: client.get("/api/billing/plans")),
        ("GET /api/me/quota", lambda: client.get("/api/me/quota")),
        ("GET /api/me/fact-checks", lambda: client.get("/api/me/fact-checks")),
    ]
    ok = True
    for label, fn in checks:
        r = fn()
        status = "[OK]" if r.status_code == 200 else "[FAIL]"
        print(f"{status} {label} -> {r.status_code}")
        if r.status_code != 200:
            print(" ", r.text[:200])
            ok = False

    tier = client.post("/api/billing/select-tier", json={"tier": "pro"})
    print(f"{'[OK]' if tier.status_code == 200 else '[FAIL]'} POST select-tier pro -> {tier.status_code}")
    if tier.status_code == 200:
        q = tier.json().get("quota", {})
        print(f"     tier={q.get('tier')} limit={q.get('limit')} remaining={q.get('remaining')}")
    else:
        ok = False
        print(" ", tier.text[:200])

    client.post("/api/billing/select-tier", json={"tier": "free"})
    print("\nDone." if ok else "\nSome checks failed.")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
