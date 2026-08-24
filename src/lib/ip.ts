import type { Context } from 'hono'

// Best-effort client IP extraction.
// Prefers Cloudflare's trusted header, then X-Forwarded-For / X-Real-IP.
// The value is only echoed back (e.g. /ip) or used for rate limiting —
// it is never persisted or logged.
export function clientIp(c: Context): string {
  return (
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  )
}
