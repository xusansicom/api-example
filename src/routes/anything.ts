import type { Context, Hono } from 'hono'

export function registerAnythingRoutes(app: Hono) {
  const handler = async (c: Context) => {
    const raw = await c.req.text()

    let body: unknown = null
    if (raw.length > 0) {
      const contentType = c.req.header('content-type') ?? ''
      try {
        body = JSON.parse(raw)
      } catch {
        if (contentType.includes('application/x-www-form-urlencoded')) {
          body = Object.fromEntries(new URLSearchParams(raw))
        } else {
          body = raw
        }
      }
    }

    const url = new URL(c.req.url)

    return c.json({
      method: c.req.method,
      url: c.req.url,
      query: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(c.req.raw.headers.entries()),
      body,
      timestamp: new Date().toISOString(),
    })
  }

  // /anything echoes any of these methods back to the caller.
  app.on(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], '/anything', handler)
}
