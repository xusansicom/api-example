import type { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { errorBody, statusText } from '../lib/http'

export function registerStatusRoutes(app: Hono) {
  app.get('/status/:code', (c) => {
    const code = Number(c.req.param('code'))

    if (!Number.isInteger(code) || code < 100 || code > 599) {
      return c.json(
        errorBody(400, 'Status code must be an integer between 100 and 599.', c.req.path),
        400,
      )
    }

    // Per the HTTP spec these statuses must not carry a body.
    if (code === 204 || code === 304) {
      return c.body(null, code)
    }

    return c.json(
      {
        success: code < 400,
        status: code,
        message: statusText(code),
        path: c.req.path,
      },
      code as ContentfulStatusCode,
    )
  })
}
