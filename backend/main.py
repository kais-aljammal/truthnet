"""FastAPI backend — run: uvicorn backend.main:app --reload --port 8000"""
import os
from typing import Any

import openai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="Hackathon API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8000)


class AnalyzeResponse(BaseModel):
    result: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(500, "OPENAI_API_KEY not set")
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": req.text}],
        )
        return AnalyzeResponse(result=response.choices[0].message.content or "")
    except Exception as e:
        raise HTTPException(502, f"AI provider error: {e}") from e


@app.post("/analyze-json")
async def analyze_json(req: AnalyzeRequest) -> dict[str, Any]:
    """Same as analyze but asks for JSON — good for structured UIs."""
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(500, "OPENAI_API_KEY not set")
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Respond with valid JSON only. Keys: summary, urgency, action.",
                },
                {"role": "user", "content": req.text},
            ],
            response_format={"type": "json_object"},
        )
        import json

        return json.loads(response.choices[0].message.content or "{}")
    except Exception as e:
        raise HTTPException(502, f"AI provider error: {e}") from e
