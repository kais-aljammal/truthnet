# 5-person team — roles & day plan

**Rule:** One **primary owner** per area. Others can help, but only the owner merges that part.

Replace **Member 1–5** with real names in your group chat when you can.

> **Random assignment** (May 16) — fair shuffle, no call needed. Re-roll tomorrow only if someone strongly mismatches skills.

---

## Roster (random — update names later)

| # | Name | Primary role | Backup if stuck |
|---|------|--------------|-----------------|
| 1 | **Member 1** | **Frontend / Demo** | Supports AI on prompt copy in UI |
| 2 | **Member 2** | **Team Lead / PM** | Helps QA at 15:00 |
| 3 | **Member 3** | **AI / ML Engineer** | Supports backend on API glue |
| 4 | **Member 4** | **Backend Developer** | Supports frontend on Streamlit wiring |
| 5 | **Member 5** | **Data & QA** | Supports lead on slides & demo script |

**Main presenter (demo + pitch):** **Member 4**  
**Backup presenter (if WiFi dies):** **Member 1**  
**Phone hotspot:** **Member 4** (charge phone + pack power bank)  
**Slide owner:** **Member 2** (Team Lead) — starts at **13:00**, not 15:30

---

## What each person owns

### 1 — Team Lead / PM
- Keeps the **40-min planning cap** (done by 09:40)
- Calls votes when the team disagrees
- Owns **5 slides** and **3-minute story** (problem → solution → demo → impact)
- At **13:00**: “Are we demo-ready?” — if no, cut scope immediately
- Does **not** need to write the most code

### 2 — AI / ML Engineer
- Owns **system prompt**, model choice (GPT-4o default), JSON schema
- Files: edit `frontend/streamlit_openai_app.py` AI block first; or `backend/main.py` if split stack
- Writes **2 demo inputs** that always return good JSON (Turkish if healthcare/education)
- Tests API once before 10:30 and again at 15:00

### 3 — Backend Developer
- **Default for 5 people:** stay on **Streamlit-only** unless you need file upload or a second service
- If all-in Streamlit: owns **error handling**, env loading, optional `backend/main.py` for later
- If split: FastAPI running by 11:00, `/health` + one `POST` endpoint
- Owns **git**: branches, merges, “last known good” tag at 15:00

### 4 — Frontend / Demo
- Owns **how it looks on a projector**: title, layout wide, metric cards, Turkish labels
- Adds **Demo 1 / Demo 2** buttons and spinner text
- No new UI features after **15:00** — only fix what breaks the demo path
- Takes **screenshot** of working app at 14:45 for backup slide

### 5 — Data & QA
- Prepares **2 demo scripts** (exact clicks + what to say)
- Runs full demo at **11:30**, **13:30**, **15:30**
- Records **30s screen video** backup by 15:00
- Finds sample CSV/image **only if** theme needs it (Kaggle / data.gov.tr)
- Mutes laptops, checks hotspot

---

## Parallel work (after 09:40 scope lock)

```
09:40–11:00
  AI (#2)     → prompt + API returns valid JSON
  Frontend(#4)→ Streamlit shell + buttons (can use fake JSON first)
  Backend (#3)→ wire real API into UI OR glue Streamlit calls
  QA (#5)     → write demo script v1 on paper
  Lead (#1)   → one-page scope: IN / OUT for today

11:00–13:00
  Everyone    → integrate on ONE machine (presenter laptop)
  QA (#5)     → first full run
  Lead (#1)   → start slide bullets (not full deck yet)

13:00–13:30  LUNCH — Lead + Presenter rehearse opening 30 seconds

13:30        INTEGRATION GATE (non-negotiable)
  QA runs demo twice; if fail → Lead cuts one feature

13:30–15:00
  Frontend polish + AI prompt tweaks only
  Backend bugfixes only
  QA final tests

15:00        CODE FREEZE — demo path only

15:00–16:00
  #1 slides, #5 backup media, Presenter rehearses with #2 beside them
  Coders: only fix demo-breaking bugs
```

---

## Skill swap (if someone is stronger elsewhere)

| If this person is actually best at… | Swap roles |
|-------------------------------------|------------|
| Strongest coder | AI or Backend, not Lead |
| Best speaker | Presenter + Lead can be same or split Lead/Presenter |
| Only designer | Frontend (#4) |
| ML coursework | AI (#2); Data track → AI owns model, QA owns CSV |
| No one likes presenting | Presenter = Lead + Frontend demo clicks; AI reads tech stack |

---

## Communication (5 people = easy to talk over each other)

- **One shared doc** (WhatsApp pinned): scope IN/OUT, demo steps, API key status
- **Decisions:** Lead has tie-break; 3-minute debates max
- **Integration laptop:** one “demo machine” — usually presenter’s — everyone `git pull` before big merges
- **Standups:** 11:00, 13:30, 15:00 — 2 minutes each, only blockers

---

## Tonight’s 15-minute team call agenda

1. Each person: **name + strongest skill** (API / UI / ML / speaking / data)
2. Assign numbers 1–5 in the table above
3. Agree: **Streamlit + GPT-4o** unless someone insists on Image track
4. One person creates **GitHub repo**; everyone runs `setup.ps1`
5. **Who brings hotspot?** _______________
6. Pick presenter — practice one sentence: “We built X for Y so Z”

---

## Recommended default for Medipol (5 people, unknown theme)

**Track:** Generative AI  
**Project shell:** `frontend/streamlit_openai_app.py`  
**Why:** Fastest path to a judge-facing demo; all 5 can contribute without waiting on training.

Adapt after theme announcement using `docs/TEAM_PREP.md` idea table.
