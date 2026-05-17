# Medipol META AI Hackathon — Team Starter Kit

**Event:** May 17, 2026 · 7 hours · Medipol Kavacık Güney Kampüsü

This repo is your copy-paste foundation for hackathon day. Goal: everyone runs the same stack before you arrive.

## Quick start (each teammate, tonight)

```powershell
cd medipol-hackathon
.\scripts\setup.ps1
# Edit .env with real API keys
python scripts\verify_setup.py
streamlit run frontend\streamlit_openai_app.py
```

## Project layout

```
medipol-hackathon/
  backend/          FastAPI (optional if using Streamlit-only)
  frontend/         Streamlit apps — pick one and fork it
  models/           Hugging Face helpers
  data/             Sample CSVs / demo images
  scripts/          setup.ps1, verify_setup.py
  docs/             TEAM_PREP, DAY_OF, prompts, slides outline
```

## Which frontend to use tomorrow?

| Track | Start from |
|-------|------------|
| Generative AI | `frontend/streamlit_openai_app.py` |
| Image Processing | `frontend/streamlit_image_app.py` |
| Data Prediction | `frontend/streamlit_prediction_app.py` |

## Run commands

```powershell
# Generative UI
streamlit run frontend/streamlit_openai_app.py

# API only
uvicorn backend.main:app --reload --port 8000

# Health check
curl http://localhost:8000/health
```

## Docs checklist

- [ ] Read `docs/TEAM_OF_5.md` — assign all 5 names & presenter
- [ ] Read `docs/TEAM_PREP.md` — theme fallbacks & API keys
- [ ] Read `docs/DAY_OF.md` — pin schedule in group chat
- [ ] Skim `docs/VIBE_CODING_PROMPTS.md` in Cursor
- [ ] Create GitHub repo & add teammates

## Pre-event checklist

```
[ ] Python 3.10+
[ ] venv + pip install -r requirements.txt
[ ] .env with OPENAI_API_KEY (tested)
[ ] streamlit demo runs locally
[ ] Roles & presenter chosen
[ ] Phone hotspot tested
[ ] Laptop charged
```

Good luck — narrow scope, working demo, strong story.
