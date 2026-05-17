from __future__ import annotations

import argparse
import asyncio
import json
import sys
from typing import Any, Dict

from backend.agents import (
    AGENT_A_PROVIDER,
    AGENT_B_PROVIDER,
    AGENT_C_PROVIDER,
    AGENT_D_PROVIDER,
    ANTHROPIC_AGENT_A_MODEL,
    ANTHROPIC_AGENT_B_MODEL,
    ANTHROPIC_AGENT_C_MODEL,
    ANTHROPIC_AGENT_D_MODEL,
    ANTHROPIC_FALLBACK_MODEL,
    ANTHROPIC_MODEL,
    GEMINI_MODEL,
    fallback_agent_b,
    fallback_agent_c,
    run_agent_a,
    run_agent_b,
    run_agent_c,
    run_agent_d,
)


def print_json(title: str, payload: Dict[str, Any]) -> None:
    print(f"\n{title}")
    print("-" * len(title))
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def model_label(provider: str, anthropic_model: str) -> str:
    return GEMINI_MODEL if provider == "gemini" else anthropic_model


async def run_terminal_pipeline(claim: str) -> Dict[str, Any]:
    print("\n" + "=" * 70)
    print("TRUTHNET TERMINAL PIPELINE")
    print("=" * 70)
    print(f"Agent A: {AGENT_A_PROVIDER} ({model_label(AGENT_A_PROVIDER, ANTHROPIC_AGENT_A_MODEL)})")
    print(f"Agent B: {AGENT_B_PROVIDER} ({model_label(AGENT_B_PROVIDER, ANTHROPIC_AGENT_B_MODEL)})")
    print(f"Agent C: {AGENT_C_PROVIDER} ({model_label(AGENT_C_PROVIDER, ANTHROPIC_AGENT_C_MODEL)})")
    print(f"Agent D: {AGENT_D_PROVIDER} ({model_label(AGENT_D_PROVIDER, ANTHROPIC_AGENT_D_MODEL)})")
    if ANTHROPIC_FALLBACK_MODEL:
        print(f"Anthropic fallback model: {ANTHROPIC_FALLBACK_MODEL}")
    print(f"Claim: {claim}")

    print("\n[1/4] Running Agent A - Claim Extractor...")
    agent_a = await run_agent_a(claim)
    print_json("Agent A Output", agent_a)

    print("\n[2/4] Running Agent B - Prosecutor...")
    print("[3/4] Running Agent C - Defender...")
    print("Agents B and C are running in parallel.\n")

    agent_b_result, agent_c_result = await asyncio.gather(
        run_agent_b(agent_a),
        run_agent_c(agent_a),
        return_exceptions=True,
    )

    if isinstance(agent_b_result, BaseException):
        agent_b = fallback_agent_b(agent_b_result)
        print(f"Agent B failed, using fallback: {type(agent_b_result).__name__}")
    else:
        agent_b = agent_b_result

    if isinstance(agent_c_result, BaseException):
        agent_c = fallback_agent_c(agent_c_result)
        print(f"Agent C failed, using fallback: {type(agent_c_result).__name__}")
    else:
        agent_c = agent_c_result

    print_json("Agent B Output", agent_b)
    print_json("Agent C Output", agent_c)

    print("\n[4/4] Running Agent D - Judge...")
    verdict = await run_agent_d(claim, agent_a, agent_b, agent_c)
    print_json("Final Verdict", verdict)

    print("\n" + "=" * 70)
    print("DONE")
    print("=" * 70)

    return verdict


async def interactive_loop() -> None:
    print("=" * 70)
    print("TRUTHNET ONE-TERMINAL TESTER")
    print("=" * 70)
    print(f"Agent A: {AGENT_A_PROVIDER} ({model_label(AGENT_A_PROVIDER, ANTHROPIC_AGENT_A_MODEL)})")
    print(f"Agent B: {AGENT_B_PROVIDER} ({model_label(AGENT_B_PROVIDER, ANTHROPIC_AGENT_B_MODEL)})")
    print(f"Agent C: {AGENT_C_PROVIDER} ({model_label(AGENT_C_PROVIDER, ANTHROPIC_AGENT_C_MODEL)})")
    print(f"Agent D: {AGENT_D_PROVIDER} ({model_label(AGENT_D_PROVIDER, ANTHROPIC_AGENT_D_MODEL)})")
    if ANTHROPIC_FALLBACK_MODEL:
        print(f"Anthropic fallback model: {ANTHROPIC_FALLBACK_MODEL}")
    print("Type a claim and press Enter.")
    print("Type 'exit' or 'quit' to stop.")

    while True:
        claim = input("\nEnter claim: ").strip()
        if claim.lower() in {"exit", "quit"}:
            return
        if not claim:
            continue

        try:
            await run_terminal_pipeline(claim)
        except Exception as exc:
            print(f"\nERROR: {type(exc).__name__}: {exc}")


async def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run TruthNet completely in one terminal and print all outputs."
    )
    parser.add_argument(
        "claim",
        nargs="*",
        help="Optional claim to fact-check. If omitted, interactive mode starts.",
    )
    args = parser.parse_args()

    if args.claim:
        claim = " ".join(args.claim).strip()
        await run_terminal_pipeline(claim)
        return

    await interactive_loop()


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
