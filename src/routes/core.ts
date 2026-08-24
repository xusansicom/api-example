import type { Hono } from 'hono'
import { clientIp } from '../lib/ip'
import { uuid } from '../lib/uuid'

export function registerCoreRoutes(app: Hono) {
  app.get('/json', (c) =>
    c.json({
      message: 'Hello from api-example.com',
      success: true,
    }),
  )

  app.get('/uuid', (c) =>
    c.json({
      uuid: uuid(),
    }),
  )

  app.get('/headers', (c) =>
    c.json({
      headers: Object.fromEntries(c.req.raw.headers.entries()),
    }),
  )

  app.get('/ip', (c) =>
    c.json({
      ip: clientIp(c),
    }),
  )
}
