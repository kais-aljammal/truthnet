from __future__ import annotations

import asyncio
import json
import logging
import os
import time
import traceback
from pathlib import Path
from typing import Any, AsyncIterator, Awaitable, Callable, Dict, List, Tuple

logger = logging.getLogger("truthnet.pipeline")

AgentA = Callable[[str], Awaitable[Dict[str, Any]]]
AgentB = Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]
AgentC = Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]]
AgentD = Callable[[str, Dict[str, Any], Dict[str, Any], Dict[str, Any]], Awaitable[Dict[str, Any]]]
Fallback = Callable[[BaseException], Dict[str, Any]]
RunnerBundle = Tuple[AgentA, AgentB, AgentC, AgentD, Fallback, Fallback]

DEMO_FIXTURE_PATH = Path(__file__).resolve().parent / "fixtures" / "demo_result.json"

AGENT_CALL_TIMEOUT = float(os.getenv("TRUTHNET_AGENT_TIMEOUT", "10"))
TIMEOUT_A_SECONDS = float(os.getenv("TRUTHNET_TIMEOUT_A", str(AGENT_CALL_TIMEOUT)))
TIMEOUT_BC_SECONDS = float(os.getenv("TRUTHNET_TIMEOUT_BC", str(AGENT_CALL_TIMEOUT)))
TIMEOUT_D_SECONDS = float(os.getenv("TRUTHNET_TIMEOUT_D", str(AGENT_CALL_TIMEOUT)))
PIPELINE_TOTAL_TIMEOUT = float(os.getenv("TRUTHNET_PIPELINE_TIMEOUT", "28"))

DEMO_CLAIMS = [
    "Studies show that 5G towers were proven to spread COVID-19 by activating viral particles in the human bloodstream.",
    "Screen time in children has doubled since 2020 and experts say it is causing an epidemic of ADHD diagnoses worldwide.",
    "Turkey is one of the top 5 countries in the world for social media usage per capita.",
]

EXPECTED_STATUS_SEQUENCE = [
    "agent_a_running",
    "agent_a_done",
    "agents_bc_running",
    "agents_bc_done",
    "agent_d_running",
    "agent_d_done",
    "result",
]


def is_mock_mode() -> bool:
    return os.getenv("TRUTHNET_MOCK", "").strip().lower() in {"1", "true", "yes", "on"}


def is_demo_mode() -> bool:
    return os.getenv("DEMO_MODE", "").strip().lower() in {"1", "true", "yes", "on"}


def using_mock_agents() -> bool:
    return is_mock_mode() or os.getenv("TRUTHNET_USING_MOCK", "").strip() == "1"


def _fallback_agent_a(error: BaseException, user_input: str) -> Dict[str, Any]:
    return {
        "core_claims": [user_input[:500]] if user_input.strip() else [],
        "domain": "other",
        "named_entities": {"people": [], "dates": [], "orgs": [], "stats": [], "locations": []},
        "original_tone": "neutral",
        "research_prompt": user_input.strip(),
        "verifiable_elements": [],
        "opinion_elements": [],
        "error": "Agent timed out" if isinstance(error, asyncio.TimeoutError) else str(error),
        "brief": None,
    }


def _fallback_agent_b(error: BaseException) -> Dict[str, Any]:
    return {
        "stance": "INCONCLUSIVE",
        "confidence": 0.0,
        "key_evidence": [],
        "identified_manipulations": [],
        "missing_context": ["Agent B failed before completing research."],
        "summary": "",
        "error": "Agent timed out" if isinstance(error, asyncio.TimeoutError) else str(error),
        "brief": None,
    }


def _fallback_agent_c(error: BaseException) -> Dict[str, Any]:
    return {
        "stance": "INCONCLUSIVE",
        "confidence": 0.0,
        "key_evidence": [],
        "identified_manipulations": [],
        "missing_context": ["Agent C failed before completing research."],
        "summary": "",
        "error": "Agent timed out" if isinstance(error, asyncio.TimeoutError) else str(error),
        "brief": None,
    }


def _fallback_agent_d(error: BaseException) -> Dict[str, Any]:
    return {
        "verdict": "UNVERIFIABLE",
        "confidence_score": 0,
        "verdict_color": "gray",
        "headline_summary": "The judge agent could not complete synthesis.",
        "detailed_explanation": f"Agent D failed: {type(error).__name__}",
        "what_is_true": [],
        "what_is_false": [],
        "what_is_missing": ["Final verdict unavailable due to pipeline error."],
        "manipulation_techniques_detected": [],
        "top_sources": [],
        "error": "Agent timed out" if isinstance(error, asyncio.TimeoutError) else str(error),
        "brief": None,
    }


def _load_agent_runners() -> RunnerBundle:
    if is_mock_mode():
        try:
            from .agents_mock import run_agent_a, run_agent_b, run_agent_c, run_agent_d
        except ImportError:
            from agents_mock import run_agent_a, run_agent_b, run_agent_c, run_agent_d  # type: ignore

        os.environ["TRUTHNET_USING_MOCK"] = "1"
        logger.warning("TRUTHNET_MOCK is enabled; using mock agents.")
        return (
            run_agent_a,
            run_agent_b,
            run_agent_c,
            run_agent_d,
            _fallback_agent_b,
            _fallback_agent_c,
        )

    try:
        from .agents import (
            fallback_agent_b,
            fallback_agent_c,
            run_agent_a,
            run_agent_b,
            run_agent_c,
            run_agent_d,
        )
    except ImportError:
        from agents import (  # type: ignore
            fallback_agent_b,
            fallback_agent_c,
            run_agent_a,
            run_agent_b,
            run_agent_c,
            run_agent_d,
        )

    os.environ.pop("TRUTHNET_USING_MOCK", None)
    return run_agent_a, run_agent_b, run_agent_c, run_agent_d, fallback_agent_b, fallback_agent_c


def _load_demo_fixture() -> Dict[str, Any]:
    with DEMO_FIXTURE_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def _brief_from_agent(agent_output: Dict[str, Any]) -> str | None:
    if not agent_output:
        return None
    brief = agent_output.get("brief")
    if isinstance(brief, str) and brief.strip():
        return brief.strip()
    summary = agent_output.get("summary")
    if isinstance(summary, str) and summary.strip():
        return summary.strip()
    return None


def _enrich_verdict(
    verdict: Dict[str, Any],
    agent_b: Dict[str, Any],
    agent_c: Dict[str, Any],
    warnings: List[str],
    *,
    pipeline_seconds: float | None = None,
) -> Dict[str, Any]:
    result = dict(verdict)
    result["prosecution_brief"] = _brief_from_agent(agent_b)
    result["defense_brief"] = _brief_from_agent(agent_c)
    result["pipeline_warnings"] = list(warnings)
    top_sources = result.get("top_sources") or []
    result["top_sources"] = top_sources
    result["sources"] = result.get("sources") or top_sources
    result["summary"] = result.get("summary") or result.get("headline_summary")
    if pipeline_seconds is not None:
        result["pipeline_seconds"] = pipeline_seconds
    result["mock_mode"] = using_mock_agents()
    result["demo_mode"] = is_demo_mode()
    return result


async def _run_agent_safe(
    coro: Awaitable[Dict[str, Any]],
    *,
    seconds: float,
    stage: str,
    fallback: Callable[[BaseException], Dict[str, Any]],
    warnings: List[str],
) -> Dict[str, Any]:
    try:
        return await asyncio.wait_for(coro, timeout=seconds)
    except asyncio.TimeoutError as exc:
        logger.warning("%s timed out after %.0fs", stage, seconds)
        warnings.append(f"{stage} failed: timeout — partial results may be unavailable")
        return fallback(exc)
    except Exception as exc:
        logger.error("%s failed: %s", stage, exc)
        logger.debug(traceback.format_exc())
        warnings.append(f"{stage} failed: {type(exc).__name__} — {exc}")
        return fallback(exc)


async def _run_research_pair(
    run_agent_b: AgentB,
    run_agent_c: AgentC,
    agent_a: Dict[str, Any],
    fallback_agent_b: Fallback,
    fallback_agent_c: Fallback,
    warnings: List[str],
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    async def run_b() -> Dict[str, Any]:
        return await _run_agent_safe(
            run_agent_b(agent_a),
            seconds=TIMEOUT_BC_SECONDS,
            stage="Agent B",
            fallback=fallback_agent_b,
            warnings=warnings,
        )

    async def run_c() -> Dict[str, Any]:
        return await _run_agent_safe(
            run_agent_c(agent_a),
            seconds=TIMEOUT_BC_SECONDS,
            stage="Agent C",
            fallback=fallback_agent_c,
            warnings=warnings,
        )

    try:
        agent_b, agent_c = await asyncio.wait_for(
            asyncio.gather(run_b(), run_c()),
            timeout=TIMEOUT_BC_SECONDS,
        )
        return agent_b, agent_c
    except asyncio.TimeoutError as exc:
        warnings.append("Agents B & C failed: timeout — prosecution/defense briefs unavailable")
        return _fallback_agent_b(exc), _fallback_agent_c(exc)


def _sse_data(payload: Dict[str, Any]) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def _run_pipeline_inner(user_input: str) -> Dict[str, Any]:
    if is_demo_mode():
        return dict(_load_demo_fixture())

    run_agent_a, run_agent_b, run_agent_c, run_agent_d, fallback_agent_b, fallback_agent_c = (
        _load_agent_runners()
    )
    warnings: List[str] = []
    pipeline_start = time.perf_counter()

    agent_a = await _run_agent_safe(
        run_agent_a(user_input),
        seconds=TIMEOUT_A_SECONDS,
        stage="Agent A",
        fallback=lambda exc: _fallback_agent_a(exc, user_input),
        warnings=warnings,
    )

    agent_b, agent_c = await _run_research_pair(
        run_agent_b,
        run_agent_c,
        agent_a,
        fallback_agent_b,
        fallback_agent_c,
        warnings,
    )

    verdict = await _run_agent_safe(
        run_agent_d(user_input, agent_a, agent_b, agent_c),
        seconds=TIMEOUT_D_SECONDS,
        stage="Agent D",
        fallback=_fallback_agent_d,
        warnings=warnings,
    )

    return _enrich_verdict(
        verdict,
        agent_b,
        agent_c,
        warnings,
        pipeline_seconds=round(time.perf_counter() - pipeline_start, 2),
    )


async def run_pipeline(user_input: str) -> Dict[str, Any]:
    try:
        return await asyncio.wait_for(_run_pipeline_inner(user_input), timeout=PIPELINE_TOTAL_TIMEOUT)
    except asyncio.TimeoutError as exc:
        raise TimeoutError("Analysis timed out. Try a shorter or simpler claim.") from exc


async def run_pipeline_events(user_input: str) -> AsyncIterator[Dict[str, Any]]:
    if is_demo_mode():
        yield {"event": "agent_a_running", "data": {"status": "running", "step": "sources", "done": False}}
        yield {"event": "agent_a_done", "data": {"status": "done", "step": "sources", "done": True}}
        yield {
            "event": "agents_bc_running",
            "data": {"status": "running", "step": "prosecution", "done": False, "step2": "defense", "done2": False},
        }
        yield {
            "event": "agents_bc_done",
            "data": {"status": "done", "step": "prosecution", "done": True, "step2": "defense", "done2": True},
        }
        yield {"event": "agent_d_running", "data": {"status": "running", "step": "verdict", "done": False}}
        yield {"event": "agent_d_done", "data": {"status": "done", "step": "verdict", "done": True}}
        yield {"event": "verdict", "data": _load_demo_fixture()}
        return

    run_agent_a, run_agent_b, run_agent_c, run_agent_d, fallback_agent_b, fallback_agent_c = (
        _load_agent_runners()
    )
    warnings: List[str] = []
    pipeline_start = time.perf_counter()

    yield {"event": "agent_a_running", "data": {"status": "running", "step": "sources", "done": False}}
    agent_a = await _run_agent_safe(
        run_agent_a(user_input),
        seconds=TIMEOUT_A_SECONDS,
        stage="Agent A",
        fallback=lambda exc: _fallback_agent_a(exc, user_input),
        warnings=warnings,
    )
    yield {
        "event": "agent_a_done",
        "data": {"status": "done", "step": "sources", "done": True, "agent_a": agent_a},
    }

    yield {
        "event": "agents_bc_running",
        "data": {"status": "running", "step": "prosecution", "done": False, "step2": "defense", "done2": False},
    }
    agent_b, agent_c = await _run_research_pair(
        run_agent_b,
        run_agent_c,
        agent_a,
        fallback_agent_b,
        fallback_agent_c,
        warnings,
    )
    yield {
        "event": "agents_bc_done",
        "data": {
            "status": "done",
            "step": "prosecution",
            "done": True,
            "step2": "defense",
            "done2": True,
            "agent_b": agent_b,
            "agent_c": agent_c,
        },
    }

    yield {"event": "agent_d_running", "data": {"status": "running", "step": "verdict", "done": False}}
    verdict = await _run_agent_safe(
        run_agent_d(user_input, agent_a, agent_b, agent_c),
        seconds=TIMEOUT_D_SECONDS,
        stage="Agent D",
        fallback=_fallback_agent_d,
        warnings=warnings,
    )
    yield {"event": "agent_d_done", "data": {"status": "done", "step": "verdict", "done": True}}
    yield {
        "event": "verdict",
        "data": _enrich_verdict(
            verdict,
            agent_b,
            agent_c,
            warnings,
            pipeline_seconds=round(time.perf_counter() - pipeline_start, 2),
        ),
    }


async def stream_pipeline(user_input: str) -> AsyncIterator[str]:
    """POST-friendly SSE stream used by the React backend contract."""
    try:
        async with asyncio.timeout(PIPELINE_TOTAL_TIMEOUT):
            async for item in _stream_pipeline_events(user_input):
                yield item
    except TimeoutError:
        logger.exception("Pipeline stream timed out.")
        yield _sse_data(
            {
                "status": "error",
                "message": "Analysis timed out. Try a shorter or simpler claim.",
            }
        )
    except Exception as exc:
        logger.exception("Pipeline stream failed.")
        yield _sse_data({"status": "error", "message": str(exc)})


async def _stream_pipeline_events(user_input: str) -> AsyncIterator[str]:
    try:
        async for item in run_pipeline_events(user_input):
            event = item["event"]
            data = item["data"]

            if event == "verdict":
                yield _sse_data({"status": "result", "result": data})
            elif event == "agent_a_done":
                agent_a = data.get("agent_a", {})
                yield _sse_data(
                    {
                        "status": event,
                        "step": "sources",
                        "done": True,
                        "data": {
                            "domain": agent_a.get("domain"),
                            "core_claims": agent_a.get("core_claims", []),
                            "original_tone": agent_a.get("original_tone"),
                        },
                    }
                )
            elif event == "agents_bc_done":
                yield _sse_data(
                    {
                        "status": event,
                        "step": "prosecution",
                        "done": True,
                        "step2": "defense",
                        "done2": True,
                        "data": data,
                    }
                )
            elif event in {"agent_a_running", "agents_bc_running", "agent_d_running", "agent_d_done"}:
                yield _sse_data({"status": event, **{k: v for k, v in data.items() if k != "status"}})
            else:
                yield _sse_data({"status": event})
    except Exception as exc:
        logger.exception("Pipeline stream failed.")
        raise exc
