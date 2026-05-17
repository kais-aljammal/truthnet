from __future__ import annotations

import asyncio
import json

import httpx


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


async def main() -> None:
    url = "http://127.0.0.1:8000/fact-check"
    payload = {"user_input": "Studies show that 5G towers spread COVID-19."}
    statuses = []
    verdict = None

    async with httpx.AsyncClient(timeout=30.0) as client:
        async with client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            async for chunk in response.aiter_text():
                for event in _parse_sse_chunk(chunk):
                    if "status" in event:
                        statuses.append(event["status"])
                        print(event["status"])
                    if "result" in event:
                        verdict = event["result"].get("verdict")

    if not verdict:
        raise AssertionError("No verdict received from HTTP SSE stream.")
    print(f"OK - verdict={verdict} statuses={len(statuses)}")


if __name__ == "__main__":
    asyncio.run(main())
