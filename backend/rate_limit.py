from __future__ import annotations

import time
from collections import defaultdict
from dataclasses import dataclass, field
from threading import Lock
from typing import DefaultDict, Tuple

from fastapi import HTTPException, Request

from .config import RATE_LIMIT_PER_MINUTE


@dataclass
class _Bucket:
    timestamps: list[float] = field(default_factory=list)


class RateLimiter:
    """In-memory sliding-window rate limiter (per IP and per user id)."""

    def __init__(self, limit_per_minute: int) -> None:
        self.limit = limit_per_minute
        self._ip_buckets: DefaultDict[str, _Bucket] = defaultdict(_Bucket)
        self._user_buckets: DefaultDict[str, _Bucket] = defaultdict(_Bucket)
        self._lock = Lock()

    def _check(self, bucket: _Bucket, key: str) -> None:
        now = time.monotonic()
        window_start = now - 60.0
        with self._lock:
            bucket.timestamps = [t for t in bucket.timestamps if t >= window_start]
            if len(bucket.timestamps) >= self.limit:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded ({self.limit} requests per minute). Try again shortly.",
                )
            bucket.timestamps.append(now)

    def check_request(self, request: Request, user_id: int | None = None) -> None:
        client_ip = request.client.host if request.client else "unknown"
        self._check(self._ip_buckets[client_ip], client_ip)
        if user_id is not None:
            self._check(self._user_buckets[str(user_id)], str(user_id))


rate_limiter = RateLimiter(RATE_LIMIT_PER_MINUTE)
