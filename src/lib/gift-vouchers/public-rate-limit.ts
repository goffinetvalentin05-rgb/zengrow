const WINDOW_MS = 60_000;
const MAX_HITS = 40;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Limite simple en mémoire pour /v/[token]. Suffisant sans infra dédiée. */
export function consumePublicVoucherRateLimit(ip: string, now: number = Date.now()): boolean {
  const key = ip.trim() || "unknown";
  prune(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_HITS) return false;
  existing.count += 1;
  return true;
}

export function resetPublicVoucherRateLimitForTests() {
  buckets.clear();
}
