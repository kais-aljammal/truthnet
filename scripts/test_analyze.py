from __future__ import annotations

import os
import sys

import httpx

REQUIRED_FIELDS = (
    "verdict",
    "confidence_score",
    "prosecution_brief",
    "defense_brief",
    "sources",
)


def main() -> None:
    base = os.getenv("TRUTHNET_TEST_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
    url = f"{base}/analyze"
    claim = "The Great Wall of China is visible from space."
    response = httpx.post(url, json={"claim": claim}, timeout=15.0)
    response.raise_for_status()
    data = response.json()
    missing = [field for field in REQUIRED_FIELDS if field not in data or data[field] is None]
    if missing:
        raise AssertionError(f"Missing analyze response fields: {missing}")
    print(f"OK - analyze verdict={data['verdict']} sources={len(data.get('sources', []))}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"FAIL - {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
