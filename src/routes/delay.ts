import type { Hono } from 'hono'
import { errorBody } from '../lib/http'

export const MAX_DELAY_SECONDS = 10

export function registerDelayRoutes(app: Hono) {
  app.get('/delay/:seconds', async (c) => {
    const seconds = Number(c.req.param('seconds'))

    if (!Number.isFinite(seconds) || seconds < 0 || seconds > MAX_DELAY_SECONDS) {
      return c.json(
        errorBody(
          400,
          `Delay must be a number between 0 and ${MAX_DELAY_SECONDS} seconds.`,
          c.req.path,
        ),
        400,
      )
    }

    if (seconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
    }

    return c.json({
      success: true,
      message: `Delayed by ${seconds} second${seconds === 1 ? '' : 's'}.`,
      seconds,
      timestamp: new Date().toISOString(),
    })
  })
}
