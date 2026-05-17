from __future__ import annotations

import argparse
import asyncio
import json
import sys

try:
    from .agents import run_agent_a, run_agent_d
    from .pipeline import run_pipeline
except ImportError:
    from agents import run_agent_a, run_agent_d  # type: ignore
    from pipeline import run_pipeline  # type: ignore


MOCK_AGENT_B = {
    "stance": "DEBUNKS",
    "confidence": 0.9,
    "key_evidence": [
        {
            "point": "Generic debunking point for testing",
            "source": "example.com/debunk",
            "credibility": "high",
            "year": 2024,
        }
    ],
    "identified_manipulations": ["Example manipulation tactic"],
    "missing_context": ["Example missing context"],
    "summary": "MOCKED PROSECUTOR: Found evidence challenging the claim.",
}

MOCK_AGENT_C = {
    "stance": "SUPPORTS",
    "confidence": 0.4,
    "key_evidence": [
        {
            "point": "Generic supporting point for testing",
            "source": "example.com/support",
            "credibility": "medium",
            "year": 2024,
        }
    ],
    "identified_manipulations": [],
    "missing_context": [],
    "summary": "MOCKED DEFENDER: Found evidence supporting the claim.",
}


async def main() -> None:
    parser = argparse.ArgumentParser(description="TruthNet interactive tester")
    parser.add_argument(
        "--full",
        action="store_true",
        help="Run the full A -> B+C -> D pipeline instead of mocked B/C.",
    )
    args = parser.parse_args()

    print("=" * 60)
    print(" TRUTHNET INTERACTIVE TESTER")
    print("=" * 60)
    print("Type a claim to fact-check. Type 'exit' to quit.")
    if not args.full:
        print("Default mode runs Agent A and Agent D with mocked Agent B/C.")
        print("Use --full to run all four agents.\n")

    while True:
        try:
            user_input = input("\nEnter a claim to fact-check: ")
            if user_input.lower() in {"exit", "quit"}:
                break
            if not user_input.strip():
                continue

            if args.full:
                print("\nRunning full TruthNet pipeline...")
                result = await run_pipeline(user_input)
                print(json.dumps(result, indent=2, ensure_ascii=False))
                continue

            print("\n[1/3] Running Agent A (Claim Extractor)...")
            agent_a_output = await run_agent_a(user_input)
            print(json.dumps(agent_a_output, indent=2, ensure_ascii=False))

            print("\n[2/3] Mocking Agent B (Prosecutor) and Agent C (Defender)...")
            print("Mock data ready.")

            print("\n[3/3] Running Agent D (The Judge)...")
            agent_d_output = await run_agent_d(
                user_input, agent_a_output, MOCK_AGENT_B, MOCK_AGENT_C
            )
            print(json.dumps(agent_d_output, indent=2, ensure_ascii=False))
            print("\n" + "=" * 60)

        except Exception as exc:
            print(f"\nError: {exc}")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
