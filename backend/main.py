from __future__ import annotations

import asyncio
import json
import logging
import os
import secrets
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Union

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware
from starlette.staticfiles import StaticFiles

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env", override=False)

try:
    from .auth_routes import require_user, router as auth_router
    from .billing_routes import router as billing_router
    from .config import (
        AUTH_REQUIRED,
        BILLING_MODE,
        FRONTEND_DIR,
        FRONTEND_URL,
        IS_PRODUCTION,
        MAX_CLAIM_CHARS,
        QUOTA_ENFORCE,
        SESSION_SECRET,
        TIER_LIMITS,
        TRUTHNET_ENV,
    )
    from .database import FactCheck, User, get_db, init_db
    from .stripe_config import stripe_configured, webhook_configured
    from .stripe_webhooks import handle_stripe_event, verify_and_parse
    from .models import FactCheckResponse
    from .quota_service import assert_quota_available, get_public_tiers, get_quota, record_successful_check
    from .pipeline import (
        is_demo_mode,
        is_mock_mode,
        run_pipeline,
        run_pipeline_events,
        stream_pipeline,
        using_mock_agents,
    )
    from .rate_limit import rate_limiter
except ImportError:
    from auth_routes import require_user, router as auth_router  # type: ignore
    from billing_routes import router as billing_router  # type: ignore
    from config import (  # type: ignore
        AUTH_REQUIRED,
        BILLING_MODE,
        FRONTEND_DIR,
        FRONTEND_URL,
        IS_PRODUCTION,
        MAX_CLAIM_CHARS,
        QUOTA_ENFORCE,
        SESSION_SECRET,
        TIER_LIMITS,
        TRUTHNET_ENV,
    )
    from database import FactCheck, User, get_db, init_db  # type: ignore
    from stripe_config import stripe_configured, webhook_configured  # type: ignore
    from stripe_webhooks import handle_stripe_event, verify_and_parse  # type: ignore
    from models import FactCheckResponse  # type: ignore
    from quota_service import assert_quota_available, get_public_tiers, get_quota, record_successful_check  # type: ignore
    from pipeline import (  # type: ignore
        is_demo_mode,
        is_mock_mode,
        run_pipeline,
        run_pipeline_events,
        stream_pipeline,
        using_mock_agents,
    )
    from rate_limit import rate_limiter  # type: ignore

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("truthnet.main")

PROVIDER_KEY_OPTIONS = {
    "anthropic": {
        "a": ["ANTHROPIC_AGENT_A_API_KEY", "ANTHROPIC_API_KEY"],
        "b": ["ANTHROPIC_AGENT_B_API_KEY", "ANTHROPIC_AGENT_BC_API_KEY", "ANTHROPIC_API_KEY"],
        "c": ["ANTHROPIC_AGENT_C_API_KEY", "ANTHROPIC_AGENT_BC_API_KEY", "ANTHROPIC_API_KEY"],
        "d": ["ANTHROPIC_AGENT_D_API_KEY", "ANTHROPIC_API_KEY"],
    },
    "gemini": {
        "a": ["GEMINI_AGENT_A_API_KEY", "GEMINI_API_KEY"],
        "b": ["GEMINI_AGENT_B_API_KEY", "GEMINI_API_KEY"],
        "c": ["GEMINI_AGENT_C_API_KEY", "GEMINI_API_KEY"],
        "d": ["GEMINI_AGENT_D_API_KEY", "GEMINI_API_KEY"],
    },
}

SPA_ROUTES = {"/", "/login", "/signup", "/app", "/billing", "/history", "/privacy", "/terms"}

app = FastAPI(
    title="TruthNet API",
    description="4-agent adversarial fact-checking with user accounts and SSE streaming.",
    version="3.0.0",
)

_session_secret = SESSION_SECRET or (secrets.token_urlsafe(32) if not IS_PRODUCTION else "")
if IS_PRODUCTION and not SESSION_SECRET:
    logger.error("SESSION_SECRET is required in production.")
elif not SESSION_SECRET:
    logger.warning("SESSION_SECRET not set — using ephemeral secret (dev only).")

app.add_middleware(
    SessionMiddleware,
    secret_key=_session_secret or secrets.token_urlsafe(32),
    session_cookie="truthnet_session",
    max_age=60 * 60 * 24 * 14,
    same_site="lax",
    https_only=IS_PRODUCTION,
)

_cors_origins: List[str] = [FRONTEND_URL]
if not IS_PRODUCTION:
    _cors_origins.extend(
        [
            "http://127.0.0.1:8000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://localhost:3000",
        ]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if FRONTEND_DIR.exists():
    app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

app.include_router(auth_router)
app.include_router(billing_router)


def _configured(name: str) -> bool:
    value = os.getenv(name, "").strip()
    if not value:
        return False
    placeholder_tokens = ("...", "REPLACE_ME", "YOUR_", "PASTE_")
    return not any(token in value for token in placeholder_tokens)


def _gemini_keys_status() -> Dict[str, object]:
    agents = {}
    missing: List[str] = []
    for agent in ("a", "b", "c", "d"):
        provider = os.getenv(f"AGENT_{agent.upper()}_PROVIDER", "gemini").strip().lower()
        key_options = PROVIDER_KEY_OPTIONS.get(provider, {}).get(agent, [])
        ok = any(_configured(name) for name in key_options)
        agents[agent.upper()] = {"provider": provider, "configured": ok}
        if not ok:
            missing.append(f"Agent {agent.upper()}")

    return {
        "all_configured": len(missing) == 0,
        "agents": agents,
        "missing": missing,
        "model": os.getenv("GEMINI_MODEL", "gemini-3-flash-preview"),
    }


def _validate_startup_keys() -> None:
    if is_mock_mode() or is_demo_mode():
        return

    gemini = _gemini_keys_status()
    if gemini["all_configured"]:
        return

    msg = f"Missing Gemini keys: {', '.join(gemini['missing'])}"
    if IS_PRODUCTION:
        logger.error(msg)
        return

    logger.warning("%s — auto-enabling TRUTHNET_MOCK=1 for local dev.", msg)
    os.environ["TRUTHNET_MOCK"] = "1"


@app.on_event("startup")
async def startup_checks() -> None:
    init_db()
    if is_demo_mode():
        print("WARNING: DEMO_MODE is ON - pipeline is disabled, returning fixture data")
    _validate_startup_keys()
    logger.info(
        "TruthNet startup (env=%s auth=%s demo=%s mock=%s)",
        TRUTHNET_ENV,
        AUTH_REQUIRED,
        is_demo_mode(),
        is_mock_mode(),
    )


class FactCheckRequest(BaseModel):
    claim: Optional[str] = Field(default=None, min_length=1, max_length=MAX_CLAIM_CHARS)
    user_input: Optional[str] = Field(default=None, min_length=1, max_length=MAX_CLAIM_CHARS)

    @model_validator(mode="after")
    def require_claim_text(self) -> "FactCheckRequest":
        if not (self.user_input or self.claim):
            raise ValueError("Provide either 'user_input' or 'claim'.")
        return self

    @property
    def text(self) -> str:
        return (self.user_input or self.claim or "").strip()


def _check_daily_quota(user: User, db: Session) -> None:
    assert_quota_available(user, db)


def _save_fact_check(user: User, claim: str, payload: dict, db: Session) -> None:
    record_successful_check(user, claim, payload, db)


@app.get("/api/me/quota")
def me_quota(user: User = Depends(require_user), db: Session = Depends(get_db)):
    return get_quota(user, db)


@app.get("/api/me/fact-checks")
def me_fact_checks(
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    base = db.query(FactCheck).filter(FactCheck.user_id == user.id)
    total = base.count()
    rows = (
        base.order_by(FactCheck.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    items = [
        {
            "id": row.id,
            "claim_snippet": row.claim_snippet,
            "verdict": row.verdict,
            "confidence": row.confidence,
            "status": row.status,
            "created_at": row.created_at.isoformat().replace("+00:00", "Z"),
            "has_response": bool(row.response_json),
        }
        for row in rows
    ]
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@app.get("/api/me/fact-checks/{check_id}")
def me_fact_check_detail(
    check_id: int,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(FactCheck)
        .filter(FactCheck.id == check_id, FactCheck.user_id == user.id)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Fact check not found.")
    response = None
    if row.response_json:
        try:
            response = json.loads(row.response_json)
        except json.JSONDecodeError:
            response = row.response_json
    return {
        "id": row.id,
        "claim_snippet": row.claim_snippet,
        "verdict": row.verdict,
        "confidence": row.confidence,
        "status": row.status,
        "created_at": row.created_at.isoformat().replace("+00:00", "Z"),
        "response_json": response,
    }


@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    try:
        event = verify_and_parse(payload, sig)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.warning("Stripe webhook verification failed: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid webhook signature") from exc

    handle_stripe_event(event, db)
    return Response(status_code=200)


@app.get("/api/tiers")
def list_tiers():
    return {"tiers": get_public_tiers(), "timezone": "UTC"}


async def root_health_check() -> Dict[str, object]:
    gemini = _gemini_keys_status()
    mock = is_mock_mode()
    live_ready = gemini["all_configured"] and not mock and not is_demo_mode()

    status = "ok"
    if IS_PRODUCTION and not live_ready and not mock and not is_demo_mode():
        status = "degraded"

    return {
        "status": status,
        "service": "TruthNet",
        "version": "3.0.0",
        "environment": TRUTHNET_ENV,
        "mock_mode": mock,
        "demo_mode": is_demo_mode(),
        "using_mock_agents": using_mock_agents(),
        "live_gemini_ready": live_ready,
        "gemini": gemini,
        "auth_required": AUTH_REQUIRED,
        "quota_enforce": QUOTA_ENFORCE,
        "billing_mode": BILLING_MODE,
        "stripe_connected": stripe_configured(),
        "stripe_webhook_configured": webhook_configured(),
        "tier_limits": TIER_LIMITS,
        "max_claim_chars": MAX_CLAIM_CHARS,
        "routes": {"landing": "/", "login": "/login", "signup": "/signup", "app": "/app"},
    }


@app.get("/health")
async def health() -> Dict[str, object]:
    return await root_health_check()


@app.get("/api")
async def api_root() -> Dict[str, object]:
    return await root_health_check()


def _spa_index() -> FileResponse:
    index_file = FRONTEND_DIR / "TruthNet.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="Frontend files are not installed.")
    return FileResponse(index_file, media_type="text/html")


@app.get("/billing")
@app.get("/history")
async def billing_page() -> FileResponse:
    return _spa_index()


@app.get("/")
@app.get("/login")
@app.get("/signup")
@app.get("/app")
@app.get("/privacy")
@app.get("/terms")
async def spa_pages() -> FileResponse:
    return _spa_index()


async def _run_fact_check_json(
    text: str,
    user: User,
    db: Session,
) -> Union[FactCheckResponse, JSONResponse]:
    try:
        payload = await run_pipeline(text)
        _save_fact_check(user, text, payload, db)
        return FactCheckResponse.from_pipeline_dict(payload)
    except TimeoutError:
        logger.warning("Pipeline timed out for claim (%d chars)", len(text))
        return JSONResponse(
            status_code=504,
            content={"detail": "Analysis timed out. Try a shorter or simpler claim."},
        )
    except Exception as exc:
        logger.exception("Pipeline failed.")
        raise HTTPException(status_code=502, detail=f"{type(exc).__name__}: {exc}") from exc


@app.post("/fact-check")
async def fact_check(
    request: FactCheckRequest,
    http_request: Request,
    stream: bool = Query(False, description="Force Server-Sent Events response."),
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    rate_limiter.check_request(http_request, user.id)
    _check_daily_quota(user, db)
    logger.info("POST /fact-check user=%s %d chars", user.email, len(request.text))

    if stream or request.user_input is not None:

        async def streaming_with_save():
            final_payload = None
            async for chunk in stream_pipeline(request.text):
                if '"result"' in chunk or chunk.strip().endswith("}"):
                    try:
                        for line in chunk.split("\n"):
                            if line.startswith("data: "):
                                data = json.loads(line[6:])
                                if data.get("result"):
                                    final_payload = data["result"]
                    except json.JSONDecodeError:
                        pass
                yield chunk
            if final_payload:
                _save_fact_check(user, request.text, final_payload, db)

        return StreamingResponse(
            streaming_with_save(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    return await _run_fact_check_json(request.text, user, db)


@app.post("/analyze", response_model=FactCheckResponse)
async def analyze(
    request: FactCheckRequest,
    http_request: Request,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    rate_limiter.check_request(http_request, user.id)
    _check_daily_quota(user, db)
    logger.info("POST /analyze user=%s %d chars", user.email, len(request.text))
    return await _run_fact_check_json(request.text, user, db)


def _sse(event: str, data: object) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.get("/fact-check/stream")
async def fact_check_stream(
    request: Request,
    claim: str = Query(..., min_length=1),
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    rate_limiter.check_request(request, user.id)
    _check_daily_quota(user, db)

    async def event_generator():
        async for item in run_pipeline_events(claim):
            yield _sse(item["event"], item["data"])

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/status/stream")
async def status_stream(
    request: Request,
    claim: str = Query(..., min_length=1),
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    rate_limiter.check_request(request, user.id)
    _check_daily_quota(user, db)

    async def event_generator():
        async for item in run_pipeline_events(claim):
            event_name = item["event"]
            data = item["data"]
            if event_name == "verdict":
                yield _sse("result", data)
                continue
            payload = {"step": data.get("step"), "done": data.get("done", False)}
            if "step2" in data:
                payload["step2"] = data.get("step2")
                payload["done2"] = data.get("done2", False)
            yield _sse(event_name, payload)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
