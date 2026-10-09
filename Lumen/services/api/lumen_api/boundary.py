import json
import time
from collections import deque

from starlette.responses import JSONResponse


def unique_fields(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate field")
        result[key] = value
    return result


class Boundary:
    def __init__(self, app, origin):
        self.app, self.origin = app, origin
        self.attempts = {}

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        headers = dict(scope["headers"])
        unsafe = scope["method"] not in {"GET", "HEAD", "OPTIONS"}
        error = None
        if unsafe and headers.get(b"origin", b"").decode("latin1") != self.origin:
            error = (403, "ORIGIN_REJECTED")
        # ponytail: one local API process; use a shared rate-limit store before multiple instances.
        if unsafe and not error:
            now = time.monotonic()
            self.attempts = {
                key: times for key, times in self.attempts.items() if times[-1] > now - 60
            }
            key = scope.get("client", ("unknown",))[0]
            times = self.attempts.setdefault(key, deque())
            while times and times[0] <= now - 60:
                times.popleft()
            if len(times) >= 60 or len(self.attempts) > 10000:
                error = (429, "RATE_LIMITED")
            else:
                times.append(now)
        body = bytearray()
        if not error:
            while True:
                chunk = await receive()
                if chunk["type"] == "http.disconnect":
                    return
                body.extend(chunk.get("body", b""))
                if len(body) > 65536:
                    error = (413, "BODY_TOO_LARGE")
                    break
                if not chunk.get("more_body", False):
                    break
        if (
            not error
            and body
            and headers.get(b"content-type", b"").split(b";")[0].strip().lower()
            == b"application/json"
        ):
            try:
                json.loads(body, object_pairs_hook=unique_fields)
            except (ValueError, UnicodeDecodeError):
                error = (422, "INVALID_REQUEST")
        if error:
            return await JSONResponse({"detail": error[1]}, status_code=error[0])(
                scope, receive, send
            )

        async def replay():
            return {"type": "http.request", "body": bytes(body), "more_body": False}

        async def private_send(message):
            if message["type"] == "http.response.start":
                message["headers"] += [
                    (b"cache-control", b"no-store"),
                    (b"x-content-type-options", b"nosniff"),
                ]
            await send(message)

        await self.app(scope, replay, private_send)
