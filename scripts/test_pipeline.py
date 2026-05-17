from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("TRUTHNET_MOCK", "1")

from backend.pipeline import DEMO_CLAIMS, EXPECTED_STATUS_SEQUENCE, stream_pipeline  # noqa: E402


def _parse_sse_chunk(chunk: str) -> list[dict]:
    events = []
    for block in chunk.split("\n\n"):
        block = block.strip()
        if not block:
            continue
        for line in block.splitlines():
            if line.startswith("data: "):
                events.append(json.loads(line[6:]))
    return events


async def _run_one(claim: str) -> None:
    statuses = []
    result = None
    async for chunk in stream_pipeline(claim):
        for event in _parse_sse_chunk(chunk):
            if "status" in event:
                statuses.append(event["status"])
            if "result" in event:
                result = event["result"]

    if statuses != EXPECTED_STATUS_SEQUENCE:
        raise AssertionError(f"Unexpected status sequence: {statuses}")
    if not result or "verdict" not in result:
        raise AssertionError("Missing final result verdict.")
    print(f"OK - {result['verdict']} - {claim[:60]}")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Validate TruthNet mock SSE pipeline.")
    parser.add_argument("--all-demos", action="store_true", help="Run all PRD demo claims.")
    args = parser.parse_args()

    claims = DEMO_CLAIMS if args.all_demos else [DEMO_CLAIMS[0]]
    for claim in claims:
        await _run_one(claim)
    print("ALL PASSED")


if __name__ == "__main__":
    asyncio.run(main())
