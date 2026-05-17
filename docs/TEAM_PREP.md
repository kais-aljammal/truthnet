# Team prep — decide tonight

## Default stack (agree in group chat)

| Layer | Choice |
|-------|--------|
| UI | **Streamlit** (unless someone is very fast in React) |
| API | **FastAPI** only if frontend is separate; else all-in Streamlit |
| AI default | **GPT-4o** (OpenAI) |
| Backup AI | **Claude** (Anthropic) or **Hugging Face** (offline / no quota) |
| Language | **Python** |

## Roles — 5 members (one owner each)

See **`docs/TEAM_OF_5.md`** for the full roster, parallel schedule, and standup times.

| # | Name | Role | Owns |
|---|------|------|------|
| 1 | **Member 1** | Frontend / demo | Streamlit UI, demo buttons, projector layout |
| 2 | **Member 2** | Team lead / PM | Schedule, cuts scope, slides, pitch story |
| 3 | **Member 3** | AI / ML | Prompts, model, JSON output, demo texts |
| 4 | **Member 4** | Backend | API glue, `.env`, git merges; **also presents** |
| 5 | **Member 5** | Data & QA | Demo script, 3 test runs, backup video/screenshots |

**Presenter:** Member 4 · **Backup:** Member 1 · **Hotspot:** Member 4  
*(Random assignment — swap names in chat when you can.)*
## If theme is… (default idea — vote tomorrow, don’t overthink)

### Healthcare → **SymptomChat** (Generative AI, Low)
- User describes symptoms in Turkish → JSON: likely issue, urgency, next step (not a diagnosis disclaimer on slide 1).
- Demo: 2 pre-written symptom texts that always return sensible JSON.

### Education → **SmartNote** (Generative AI, Low)
- Paste lecture notes → summary + 5 quiz questions + flashcards.
- Demo: 1 short paragraph you prepared tonight.

### Environment / smart city → **EnergyForecast** or **CrowdSafe** (Data or Image)
- Data: CSV upload → predict usage / risk score.
- Image: upload photo → object count or hazard flags (YOLO/HF).

## GitHub (do tonight)

1. Create repo `medipol-hackathon-2026` (private is fine).
2. Push this folder; add all teammates as collaborators.
3. Everyone clones and runs `scripts/setup.ps1` once.

## API keys (each person OR one shared team key in a password manager)

- [OpenAI](https://platform.openai.com) — test with `verify_setup.py`
- [Anthropic](https://console.anthropic.com) — backup for text
- [Hugging Face](https://huggingface.co/settings/tokens) — models & datasets

## Pack list

- [ ] Laptop charged + charger
- [ ] Phone hotspot tested
- [ ] `.env` on machine (not in git)
- [ ] 2 demo screenshots / 30s screen recording backup
- [ ] HDMI/USB-C adapter if presenting
