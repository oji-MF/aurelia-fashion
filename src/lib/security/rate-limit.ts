import { NextResponse } from "next/server";

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

/**
 * Lightweight in-memory sliding-window limiter for serverless route handlers.
 * For multi-instance production, swap the Map for Appwrite/Redis backed state.
 */
export function rateLimit(
  request: Request,
  key: string,
  limit = 30,
  windowMs = 60_000,
): NextResponse | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }
  current.count += 1;
  if (current.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) } },
    );
  }
  return null;
}

// Prevent unbounded growth in long-lived processes.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key);
    }
  }, 60_000).unref?.();
}
