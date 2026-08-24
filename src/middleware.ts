import { bodyLimit } from 'hono/body-limit'
import type { Context, Next } from 'hono'
import { errorBody } from './lib/http'
import { clientIp } from './lib/ip'

export const MAX_BODY_BYTES = 100 * 1024 // 100 KB

// Streaming body size guard applied to every mutating method.
// Exceeding the limit returns 413 before the handler runs.
export const limitBody = bodyLimit({
  maxSize: MAX_BODY_BYTES,
  onError: (c) =>
    c.json(errorBody(413, 'Request body too large (max 100 KB).', c.req.path), 413),
})

export interface RateLimitOptions {
  limit: number
  windowSeconds: number
}

// Per-isolate in-memory fixed-window rate limiter keyed by client IP.
// Stateless across restarts and isolates; good enough for basic abuse
// prevention on a public edge service. See README for an optional
// KV-backed upgrade that works globally.
export function rateLimit({ limit, windowSeconds }: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return async (c: Context, next: Next) => {
    // Never rate-limit CORS preflights.
    if (c.req.method === 'OPTIONS') return next()

    const now = Date.now()

    // Opportunistic cleanup so the map cannot grow unbounded.
    if (hits.size > 10_000) {
      for (const [key, rec] of hits) {
        if (rec.resetAt <= now) hits.delete(key)
      }
    }

    const key = clientIp(c)
    let rec = hits.get(key)
    if (!rec || rec.resetAt <= now) {
      rec = { count: 0, resetAt: now + windowSeconds * 1000 }
      hits.set(key, rec)
    }
    rec.count += 1

    c.header('X-RateLimit-Limit', String(limit))
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - rec.count)))
    c.header('X-RateLimit-Reset', String(Math.ceil(rec.resetAt / 1000)))

    if (rec.count > limit) {
      c.header('Retry-After', String(Math.max(1, Math.ceil((rec.resetAt - now) / 1000))))
      return c.json(errorBody(429, 'Rate limit exceeded. Please retry later.', c.req.path), 429)
    }

    return next()
  }
}
