from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SourceItem(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    supports: Optional[str] = None
    snippet: Optional[str] = None
    credibility: Optional[str] = None


class FactCheckResponse(BaseModel):
    verdict: str = "UNVERIFIABLE"
    confidence_score: Optional[float] = None
    verdict_color: Optional[str] = None
    headline_summary: Optional[str] = None
    summary: Optional[str] = None
    detailed_explanation: Optional[str] = None
    prosecution_brief: Optional[str] = None
    defense_brief: Optional[str] = None
    what_is_true: List[str] = Field(default_factory=list)
    what_is_false: List[str] = Field(default_factory=list)
    what_is_missing: List[str] = Field(default_factory=list)
    manipulation_techniques_detected: List[str] = Field(default_factory=list)
    top_sources: List[SourceItem] = Field(default_factory=list)
    sources: List[SourceItem] = Field(default_factory=list)
    bias_rating_of_original: Optional[str] = None
    domain_expert_note: Optional[str] = None
    error_margin_note: Optional[str] = None
    pipeline_warnings: List[str] = Field(default_factory=list)
    pipeline_seconds: Optional[float] = None
    mock_mode: Optional[bool] = None
    demo_mode: Optional[bool] = None

    model_config = {"extra": "allow"}

    @classmethod
    def from_pipeline_dict(cls, payload: Dict[str, Any]) -> "FactCheckResponse":
        data = dict(payload)
        if data.get("sources") is None and data.get("top_sources") is not None:
            data["sources"] = data["top_sources"]
        if data.get("summary") is None:
            data["summary"] = data.get("headline_summary")
        return cls(**data)
