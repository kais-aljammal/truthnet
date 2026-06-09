# TruthNet

Real-time, claim-level fact-checking with an adversarial 4-agent AI pipeline. Users sign up, paste any claim, and receive a sourced verdict with confidence scores in ~30 seconds.

**Public URLs:** `/` landing · `/login` · `/signup` · `/app` fact-checker · `/billing` · `/history` · `/health` API status

## Architecture

```
User claim
   → Agent A: source gathering
   → Agent B ∥ Agent C: prosecution + defense (parallel)
   → Agent D: final judgment
   → SSE stream → React UI
```

Production LLM stack: **Gemini 3 Flash** (`gemini-3-flash-preview`) with Google Search grounding and Google Fact Check API.

## Quick start (local)

```powershell
.\scripts\setup.ps1          # once: venv + pip install
.\scripts\build_frontend.ps1 # compile JSX bundles
.\scripts\run.ps1            # start server (demo mode, auth optional)
```

Open **http://127.0.0.1:8000/** for the landing page, or **http://127.0.0.1:8000/app** for the fact-checker.

## Environment variables

Copy `.env.example` → `.env`. Key sections:

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Live Gemini 3 agents (required in production) |
| `GOOGLE_API_KEY` / `GOOGLE_FACT_CHECK_API_KEY` | Agents B/C pre-search |
| `SESSION_SECRET` | Cookie signing (required in production) |
| `DATABASE_URL` | SQLite locally; Postgres in production |
| `FRONTEND_URL` | Public URL for CORS |
| `TRUTHNET_ENV` | `production` enables strict mode |
| `AUTH_REQUIRED` | `true` = login required for fact-checks |
| `TRUTHNET_MOCK` | `1` = fake agents (CI/local without billing) |
| `DEMO_MODE` | `true` = instant fixture result (no API calls); also exempts quota |
| `QUOTA_ENFORCE` | `true` = tier daily limits (3/15/30/50) |
| `BILLING_MODE` | `manual` = preview tiers without payment; `stripe` = Checkout |
| `STRIPE_*` | Secret key, webhook secret, price IDs (see `.env.example`) |

Never commit `.env` or API keys.

## Auth flow

1. **Sign up** at `/signup` — email + password (bcrypt hashed server-side)
2. **Log in** at `/login` — httpOnly session cookie (`truthnet_session`)
3. **Fact-check** at `/app` — requires session when `AUTH_REQUIRED=true`
4. **Log out** — clears session

API endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

## Deploy to production (Render — recommended)

1. Push repo to GitHub
2. Create a **Render Web Service** from `render.yaml` (Docker)
3. Create a **Render Postgres** database (linked in blueprint)
4. Set secrets in the Render dashboard:

```env
TRUTHNET_ENV=production
AUTH_REQUIRED=true
TRUTHNET_MOCK=0
DEMO_MODE=false
FRONTEND_URL=https://your-app.onrender.com
SESSION_SECRET=<long random string>
GEMINI_API_KEY=<your key>
GOOGLE_API_KEY=<optional>
GOOGLE_FACT_CHECK_API_KEY=<optional>
```

5. Deploy — Render runs `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

**Docker (any host):**

```bash
docker build -t truthnet .
docker run -p 8000:8000 --env-file .env truthnet
```

Or `docker compose up` with `docker-compose.yml`.

## Health check

```bash
curl https://your-app.onrender.com/health
```

Returns Gemini key status, mock mode, auth config, and route map. In production, `status: degraded` if Gemini keys are missing.

## Subscription tiers

| Tier | Daily checks | Price |
|------|--------------|-------|
| Free | 3 | $0 |
| Standard | 15 | $19.99/mo |
| Pro | 30 | $34.99/mo |
| Max | 50 | $49.99/mo |

Limits reset at **midnight UTC**. Only **successful** fact-checks count. Failed/timeout runs do not consume quota.

## Rate limits

- **10 requests/minute** per IP and per user (`RATE_LIMIT_PER_MINUTE`)
- **Tier daily quota** via `usage_daily` table (see tiers above)

## API (authenticated when AUTH_REQUIRED=true)

SSE fact-check:

```bash
curl -N -X POST https://your-app.onrender.com/fact-check \
  -H "Content-Type: application/json" \
  -b "truthnet_session=..." \
  -d '{"user_input":"The Great Wall is visible from the Moon"}'
```

For scripts/CI without auth, set `AUTH_REQUIRED=false`.

### Billing & quota API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/me/quota` | Today's usage, tier, reset time |
| `GET /api/tiers` | Public tier catalog |
| `GET /api/billing/status` | `manual` vs `stripe`, Stripe connected |
| `POST /api/billing/select-tier` | Manual tier preview (`BILLING_MODE=manual`) |
| `POST /api/billing/checkout` | Stripe Checkout URL (`BILLING_MODE=stripe`) |
| `POST /api/billing/portal` | Stripe Customer Portal |
| `POST /webhooks/stripe` | Stripe subscription webhooks |
| `GET /api/me/fact-checks` | Paginated check history |
| `GET /api/me/fact-checks/{id}` | Full `response_json` for one check |

## Frontend development

Edit `frontend/*.jsx`, then rebuild:

```powershell
.\scripts\build_frontend.ps1
```

Load order: `components` → `plans` → `quota` → `app` → `landing` → `auth` → `legal` → `billing` → `history` → `router`

## Manual test checklist (all phases)

Use these settings in `.env` for tier testing:

```env
AUTH_REQUIRED=true
QUOTA_ENFORCE=true
BILLING_MODE=manual
DEMO_MODE=false
TRUTHNET_MOCK=1
```

1. **Phase 1 — Quota & tiers**
   - Register / log in → `/app` shows quota chip (e.g. `3 / 3 left today` on Free)
   - Run fact-checks until limit → submit blocked + banner
   - `/billing` → select **Pro** → chip shows 30/day
   - `GET /api/me/quota` returns `tier`, `used`, `remaining`

2. **Phase 2 — Stripe** (optional; needs Stripe test keys)
   - Set `BILLING_MODE=stripe` + `STRIPE_SECRET_KEY` + price IDs
   - Landing **Subscribe** → Stripe Checkout
   - Return to `/app?billing=success` → “Activating…” then updated quota
   - Webhook: `stripe listen --forward-to localhost:8000/webhooks/stripe`

3. **Phase 3 — History**
   - After successful checks → `/history` lists claim, verdict, date
   - Click row → expands full JSON verdict

Quick API smoke test:

```powershell
.\.venv\Scripts\python scripts\test_tiers_api.py
```

## Test plan (production)

1. Open `/` — landing page loads with 4 pricing cards
2. Register at `/signup`
3. Log in at `/login`
4. Submit a claim at `/app` — SSE pipeline completes with verdict
5. Check `/health` — `live_gemini_ready: true`, `mock_mode: false`
6. `/billing` and `/history` work when authenticated

## Known limitations (v1)

- Email/password only (no Google OAuth yet)
- In-memory rate limiter (resets on deploy; use Redis in v2)
- Quota increment is post-success (tiny race under extreme concurrency)

## License

All rights reserved. See `LICENSE`.
