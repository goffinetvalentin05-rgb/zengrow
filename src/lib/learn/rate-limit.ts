const buckets = new Map<string, { count: number; reset: number }>();

export function takeRateLimit(key: string, limit = 60, windowMs = 60_000, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true as const, remaining: limit - 1 };
  }
  if (current.count >= limit) return { ok: false as const, remaining: 0 };
  current.count += 1;
  return { ok: true as const, remaining: limit - current.count };
}
