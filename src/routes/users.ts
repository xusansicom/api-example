import type { Hono } from 'hono'
import { USERS } from '../data'
import { errorBody } from '../lib/http'

export function registerUserRoutes(app: Hono) {
  app.get('/users', (c) => c.json(USERS))

  app.get('/users/:id', (c) => {
    const id = Number(c.req.param('id'))
    const user = Number.isInteger(id) ? USERS.find((u) => u.id === id) : undefined
    if (!user) {
      return c.json(errorBody(404, 'User not found.', c.req.path), 404)
    }
    return c.json(user)
  })
}
