import type { Hono } from 'hono'
import { POSTS } from '../data'
import { errorBody } from '../lib/http'

export function registerPostRoutes(app: Hono) {
  app.get('/posts', (c) => c.json(POSTS))

  app.get('/posts/:id', (c) => {
    const id = Number(c.req.param('id'))
    const post = Number.isInteger(id) ? POSTS.find((p) => p.id === id) : undefined
    if (!post) {
      return c.json(errorBody(404, 'Post not found.', c.req.path), 404)
    }
    return c.json(post)
  })
}
