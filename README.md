# TruthNet Backend

TruthNet is a four-agent fact-checking backend:

```text
Agent A -> Agent B + Agent C in parallel -> Agent D
```

- Agent A extracts structured claims.
- Agent B builds the prosecution/debunking case.
- Agent C builds the strongest honest defense/context case.
- Agent D synthesizes the final verdict.

## Setup

```bash
cd "/Users/selim/Documents/New project"
source .venv/bin/activate
pip install -r requirements.txt
```

Real API keys live in `.env`. Do not commit or paste that file.

## Terminal Demo

```bash
python truthnet_terminal.py
python truthnet_terminal.py "does israel have nukes"
```

## API Server

```bash
uvicorn backend.main:app --reload --port 8000
```

Health:

```bash
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/health
```

Backward-compatible JSON verdict:

```bash
curl -X POST http://127.0.0.1:8000/fact-check \
  -H "Content-Type: application/json" \
  -d '{"claim":"does israel have nukes"}'
```

React/SSE contract:

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

## Mock Mode

Mock mode tests orchestration without live model calls:

```bash
TRUTHNET_MOCK=1 python scripts/test_pipeline.py
TRUTHNET_MOCK=1 python scripts/test_pipeline.py --all-demos
```

For HTTP SSE smoke testing, start the server with mock mode enabled:

```bash
TRUTHNET_MOCK=1 uvicorn backend.main:app --reload --port 8000
python scripts/test_sse_http.py
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

The current live split is configured through per-agent provider/model flags in `.env`.
