from __future__ import annotations

import asyncio
import json
import sys

from agents import run_agent_a, run_agent_d


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
    print("=" * 60)
    print(" TRUTHNET - MEMBER 1 INTERACTIVE TESTER")
    print("=" * 60)
    print("Type a claim to test Agent A and Agent D.")
    print("Agent B and C are mocked to skip Member 2's part.")
    print("Type 'exit' to quit.\n")

    while True:
        try:
            user_input = input("\nEnter a claim to fact-check: ")
            if user_input.lower() in {"exit", "quit"}:
                break
            if not user_input.strip():
                continue

            print("\n[1/3] Running Agent A (Claim Extractor)...")
            agent_a_output = await run_agent_a(user_input)
            print("Agent A Output:")
            print(json.dumps(agent_a_output, indent=2, ensure_ascii=False))

            print("\n[2/3] Mocking Agent B (Prosecutor) and Agent C (Defender)...")
            print("Mock data ready.")

            print("\n[3/3] Running Agent D (The Judge)...")
            agent_d_output = await run_agent_d(
                user_input, agent_a_output, MOCK_AGENT_B, MOCK_AGENT_C
            )
            print("Final Verdict (Agent D):")
            print(json.dumps(agent_d_output, indent=2, ensure_ascii=False))
            print("\n" + "=" * 60)

        except Exception as exc:
            print(f"\nError: {exc}")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
