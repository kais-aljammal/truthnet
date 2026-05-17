from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict

logger = logging.getLogger("truthnet.agents_mock")

DELAY_A_SECONDS = 0.4
DELAY_BC_SECONDS = 0.6
DELAY_D_SECONDS = 0.5


async def run_agent_a(user_input: str) -> Dict[str, Any]:
    await asyncio.sleep(DELAY_A_SECONDS)
    logger.info("Mock Agent A extracted a claim from %d chars.", len(user_input))
    return {
        "core_claims": [user_input[:120]],
        "domain": "science",
        "named_entities": {"people": [], "dates": [], "orgs": [], "stats": [], "locations": []},
        "original_tone": "alarmist",
        "research_prompt": user_input,
        "verifiable_elements": ["claim text"],
        "opinion_elements": [],
    }


async def run_agent_b(agent_a_output: Dict[str, Any]) -> Dict[str, Any]:
    await asyncio.sleep(DELAY_BC_SECONDS)
    logger.info("Mock Agent B completed prosecution research.")
    return {
        "stance": "DEBUNKS",
        "confidence": 0.85,
        "key_evidence": [
            {
                "point": "Mock source found no credible evidence supporting the claim.",
                "source": "https://www.who.int/",
                "credibility": "high",
                "year": 2026,
            }
        ],
        "identified_manipulations": ["false causation"],
        "missing_context": [],
        "summary": "Mock prosecution: mainstream sources contradict the claim.",
    }


async def run_agent_c(agent_a_output: Dict[str, Any]) -> Dict[str, Any]:
    await asyncio.sleep(DELAY_BC_SECONDS)
    logger.info("Mock Agent C completed defense research.")
    return {
        "stance": "INCONCLUSIVE",
        "confidence": 0.35,
        "key_evidence": [],
        "identified_manipulations": [],
        "missing_context": ["Peer-reviewed replication would be needed."],
        "summary": "Mock defense: insufficient supporting evidence found.",
    }


async def run_agent_d(
    user_input: str,
    agent_a: Dict[str, Any],
    agent_b: Dict[str, Any],
    agent_c: Dict[str, Any],
) -> Dict[str, Any]:
    await asyncio.sleep(DELAY_D_SECONDS)
    logger.info("Mock Agent D synthesized a verdict.")
    return {
        "verdict": "FALSE",
        "confidence_score": 88,
        "verdict_color": "red",
        "headline_summary": "Mock verdict: the claim is not supported by credible evidence.",
        "detailed_explanation": (
            "This is a mock verdict for testing orchestration and SSE streaming. "
            "Disable TRUTHNET_MOCK to run the real multi-agent fact-checking pipeline."
        ),
        "what_is_true": [],
        "what_is_false": agent_a.get("core_claims", []),
        "what_is_missing": ["Live research from Agents B and C"],
        "manipulation_techniques_detected": agent_b.get("identified_manipulations", []),
        "top_sources": [
            {"title": "Mock WHO source", "url": "https://www.who.int/", "supports": "debunks"}
        ],
        "bias_rating_of_original": agent_a.get("original_tone", "neutral"),
        "domain_expert_note": "Mock mode is for integration testing only.",
        "error_margin_note": "Simulated confidence; not based on live fact-checking.",
    }
