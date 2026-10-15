import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const routes: Record<string, readonly string[]> = {
  "auth/register": ["POST"],
  "auth/login": ["POST"],
  "auth/logout": ["POST"],
  me: ["GET"],
  consent: ["PATCH"],
  events: ["GET", "POST"],
  moods: ["GET"],
  export: ["GET"],
  account: ["DELETE"],
};

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join("/");
  const methods = /^events\/[0-9a-f-]{36}$/i.test(path)
    ? ["DELETE", "PATCH"]
    : routes[path];
  if (!methods?.includes(request.method))
    return NextResponse.json({ detail: "NOT_FOUND" }, { status: 404 });
  const origin = process.env.WEB_ORIGIN ?? "http://localhost:3180";
  if (request.method !== "GET" && request.headers.get("origin") !== origin)
    return NextResponse.json({ detail: "ORIGIN_REJECTED" }, { status: 403 });
  const allowedQueries =
    path === "events"
      ? ["limit", "before"]
      : path === "moods"
        ? ["start", "end"]
        : [];
  for (const key of request.nextUrl.searchParams.keys())
    if (!allowedQueries.includes(key))
      return NextResponse.json({ detail: "INVALID_REQUEST" }, { status: 422 });
  const headers = new Headers();
  for (const name of [
    "cookie",
    "content-type",
    "origin",
    "idempotency-key",
    "x-lumen-account",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const chunks: Uint8Array[] = [];
  let length = 0;
  const reader = request.body?.getReader();
  if (reader) {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.length;
      if (length > 65536) {
        await reader.cancel();
        return NextResponse.json({ detail: "BODY_TOO_LARGE" }, { status: 413 });
      }
      chunks.push(chunk.value);
    }
  }
  try {
    const upstream = await fetch(
      `${process.env.LUMEN_API_URL ?? "http://127.0.0.1:8060"}/${path}${request.nextUrl.search}`,
      {
        method: request.method,
        headers,
        body: length ? Buffer.concat(chunks) : undefined,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      },
    );
    const response = new NextResponse(
      upstream.status === 204 ? null : await upstream.arrayBuffer(),
      { status: upstream.status },
    );
    response.headers.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/json",
    );
    response.headers.set("Cache-Control", "no-store");
    for (const value of upstream.headers.getSetCookie())
      response.headers.append("Set-Cookie", value);
    return response;
  } catch {
    return NextResponse.json(
      { detail: "SERVICE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
