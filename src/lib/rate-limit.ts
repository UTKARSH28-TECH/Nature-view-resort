/**
 * Small in-memory sliding-window rate limiter.
 *
 * Limitation (documented in docs/ENQUIRIES.md): state lives in one server process. On serverless or
 * multi-instance hosting each instance counts separately, so this only slows abuse. For a hard limit use a
 * shared store (for example Upstash Redis) behind the same interface.
 */
export type RateLimiter = {
  /** Records a hit and says whether it is allowed. */
  hit(key: string, now?: number): { allowed: boolean; retryAfterSeconds: number };
};

export function createRateLimiter(opts: { windowMs: number; max: number; maxKeys?: number }): RateLimiter {
  const hits = new Map<string, number[]>();
  const maxKeys = opts.maxKeys ?? 5000;

  return {
    hit(key, now = Date.now()) {
      const since = now - opts.windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > since);

      if (recent.length >= opts.max) {
        hits.set(key, recent);
        const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + opts.windowMs - now) / 1000));
        return { allowed: false, retryAfterSeconds };
      }

      recent.push(now);
      hits.set(key, recent);

      // Keep memory bounded: drop expired keys when the map grows.
      if (hits.size > maxKeys) {
        for (const [k, v] of hits) {
          if (v.every((t) => t <= since)) hits.delete(k);
        }
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
