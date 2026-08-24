import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorBody } from './lib/http'
import { limitBody, rateLimit } from './middleware'
import { registerAnythingRoutes } from './routes/anything'
import { registerCoreRoutes } from './routes/core'
import { registerDelayRoutes } from './routes/delay'
import { registerFallback } from './routes/fallback'
import { registerPageRoutes } from './routes/pages'
import { registerPostRoutes } from './routes/posts'
import { registerStatusRoutes } from './routes/status'
import { registerUserRoutes } from './routes/users'

export interface AppOptions {
  // Rate limiting is on by default. Pass false to disable (e.g. in tests),
  // or pass a custom limit/window.
  rateLimit?: false | { limit: number; windowSeconds: number }
}

export function createApp(options: AppOptions = {}) {
  const app = new Hono()

  // CORS: allow any origin (public example API).
  app.use('*', cors())

  if (options.rateLimit !== false) {
    const cfg = options.rateLimit ?? { limit: 120, windowSeconds: 60 }
    app.use('*', rateLimit(cfg))
  }

  // Handle bare OPTIONS preflights (Hono's cors middleware already covers
  // preflights that carry Access-Control-Request-Method).
  app.on('OPTIONS', '*', (c) => c.newResponse(null, 204))

  // Body size guard for every mutating method.
  app.on(['POST', 'PUT', 'PATCH', 'DELETE'], '*', limitBody)

  registerPageRoutes(app)
  registerCoreRoutes(app)
  registerUserRoutes(app)
  registerPostRoutes(app)
  registerStatusRoutes(app)
  registerDelayRoutes(app)
  registerAnythingRoutes(app)
  registerFallback(app)

  // Anything unexpected becomes a uniform 500 JSON error.
  app.onError((err, c) => {
    console.error(err)
    return c.json(errorBody(500, 'Internal Server Error.', c.req.path), 500)
  })

  return app
}
