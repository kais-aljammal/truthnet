# TruthNet

TruthNet is a web app for checking suspicious claims, headlines, and social-media posts with an adversarial AI workflow. The point is simple: instead of asking one model for an instant answer, TruthNet splits the job across multiple agents so the final verdict has both a case against the claim and the strongest honest case for it.

The website is designed like a research journal. A user pastes a claim, watches the pipeline run in real time, then gets a verdict with a confidence score, explanation, missing context, manipulation techniques, and sources.

## What It Does

- Turns messy input into specific fact-checkable claims.
- Runs a prosecution agent that looks for evidence challenging or debunking the claim.
- Runs a defense agent that looks for the strongest legitimate support or context.
- Sends both sides to a judge agent that produces the final verdict.
- Streams progress to the frontend so the user sees each stage complete.

## How It Works

```
User claim
   -> Agent A: extract structured claims
   -> Agent B: prosecution/debunking research
   -> Agent C: defense/context research
   -> Agent D: final judgment
   -> Website verdict
```

Agent B and Agent C run in parallel. This keeps the app faster and makes the final judgment less one-sided.

Final verdicts can be:

```text
TRUE
FALSE
MISLEADING
PARTIALLY_TRUE
UNVERIFIABLE
SATIRE
```

## Website Flow

1. Open the TruthNet website.
2. Paste a claim, headline, or post into the input box.
3. Submit it for fact-checking.
4. Watch the live agent timeline update.
5. Read the final verdict, supporting details, missing context, and source list.

The frontend lives in `frontend/TruthNet.html`, with React components in `frontend/app.jsx` and `frontend/components.jsx`.

## Backend

The backend is a FastAPI service. Main files:

- `backend/main.py` exposes the API and serves the frontend.
- `backend/pipeline.py` coordinates the four-agent workflow.
- `backend/agents.py` contains live Anthropic/Gemini agent implementations.
- `backend/agents_mock.py` contains fake agents for testing without API calls.

## Setup

```bash
cd "/Users/selim/Documents/New project"
source .venv/bin/activate
pip install -r requirements.txt
```

Real API keys belong only in `.env`. Do not commit `.env`, screenshots of `.env`, terminal output containing keys, or copied key values.

Use `.env.example` as the template:

```bash
cp .env.example .env
```

Then fill in the providers you want to use.

## Run The Website

Start the backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

Open:

```text
http://127.0.0.1:8000/app
```

Health checks:

```bash
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/health
```

## Mock Mode

Mock mode is for demos and tests without spending API credits.

```bash
TRUTHNET_MOCK=1 uvicorn backend.main:app --reload --port 8000
```

Run the pipeline tests:

```bash
TRUTHNET_MOCK=1 python scripts/test_pipeline.py
TRUTHNET_MOCK=1 python scripts/test_pipeline.py --all-demos
```

Run the HTTP/SSE smoke test after starting the server in mock mode:

```bash
python scripts/test_sse_http.py
```

## API

JSON verdict mode:

```bash
curl -X POST http://127.0.0.1:8000/fact-check \
  -H "Content-Type: application/json" \
  -d '{"claim":"does israel have nukes"}'
```

Website/SSE mode:

```bash
curl -N -X POST http://127.0.0.1:8000/fact-check \
  -H "Content-Type: application/json" \
  -d '{"user_input":"does israel have nukes"}'
```

SSE status order:

```text
agent_a_running
agent_a_done
agents_bc_running
agents_bc_done
agent_d_running
agent_d_done
result
```

Final SSE message shape:

```json
{"status":"result","result":{"verdict":"FALSE"}}
```

## Terminal Demo

```bash
python truthnet_terminal.py
python truthnet_terminal.py "does israel have nukes"
```

## Configuration

Useful `.env` flags:

```env
TRUTHNET_MOCK=0
TRUTHNET_TIMEOUT_A=8
TRUTHNET_TIMEOUT_BC=16
TRUTHNET_TIMEOUT_D=30
ANTHROPIC_DISABLE_WEB_SEARCH=false
```

The live model split is configured through per-agent provider/model flags in `.env`.

## License

All rights reserved. See `LICENSE`.
