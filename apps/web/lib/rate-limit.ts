/**
 * Sliding window in-memory rate limiter.
 * Uses a Map<key, timestamps[]> to track request times.
 * Thread-safe for single-process (serverless edge/Node); for multi-instance
 * deployments, replace with Redis (Upstash, etc.) — this is suitable for MVP.
 */

interface RateLimitOptions {
  /** Max requests allowed within `windowMs`. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  /** Remaining requests in current window. */
  remaining: number;
  /** Unix ms timestamp when the oldest request in the window expires. */
  resetAt: number;
}

// Global store — persists across requests in the same process.
const store = new Map<string, number[]>();

// Periodic cleanup to prevent unbounded memory growth (every 5 minutes).
let cleanupInterval: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, timestamps] of store.entries()) {
        // Remove entries that are older than 10 minutes (safe upper bound).
        const pruned = timestamps.filter((t) => now - t < 10 * 60 * 1000);
        if (pruned.length === 0) {
          store.delete(key);
        } else {
          store.set(key, pruned);
        }
      }
    },
    5 * 60 * 1000
  );
  // Don't block process exit
  if (cleanupInterval.unref) cleanupInterval.unref();
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const windowStart = now - options.windowMs;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= options.limit) {
    const resetAt = (timestamps[0] ?? now) + options.windowMs;
    return { success: false, remaining: 0, resetAt };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  const resetAt = timestamps.length > 0 ? (timestamps[0] ?? now) + options.windowMs : now + options.windowMs;
  return { success: true, remaining: options.limit - timestamps.length, resetAt };
}

/**
 * Convenience wrapper that returns a 429 Response when rate limited.
 * Returns null when the request is allowed.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { limited: true; response: Response } | { limited: false } {
  const result = rateLimit(key, options);

  if (!result.success) {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    return {
      limited: true,
      response: new Response(
        JSON.stringify({ error: 'Too many requests', retryAfter: retryAfterSec }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(options.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
          },
        }
      ),
    };
  }

  return { limited: false };
}

/** Extract a best-effort IP address from a NextRequest-compatible object. */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}
