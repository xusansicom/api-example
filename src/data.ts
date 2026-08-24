// Fixed, database-free example data. Keep these stable: developers link to
// /users/:id and /posts/:id from docs, READMEs and tests.

export interface User {
  id: number
  name: string
  username: string
  email: string
}

export interface Post {
  id: number
  userId: number
  title: string
  body: string
}

export const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', username: 'ada', email: 'ada@example.com' },
  { id: 2, name: 'Alan Turing', username: 'alan', email: 'alan@example.com' },
  { id: 3, name: 'Grace Hopper', username: 'grace', email: 'grace@example.com' },
  { id: 4, name: 'Linus Torvalds', username: 'linus', email: 'linus@example.com' },
  { id: 5, name: 'Margaret Hamilton', username: 'margaret', email: 'margaret@example.com' },
  { id: 6, name: 'Guido van Rossum', username: 'guido', email: 'guido@example.com' },
]

export const POSTS: Post[] = [
  {
    id: 1,
    userId: 1,
    title: 'Getting started with api-example.com',
    body: 'Stop inventing fake API URLs. Use one that works.',
  },
  {
    id: 2,
    userId: 2,
    title: 'How to test a webhook endpoint',
    body: 'Point your webhook at /anything and inspect what your service actually sends.',
  },
  {
    id: 3,
    userId: 3,
    title: 'Mocking responses for frontend demos',
    body: 'Use /users and /posts as drop-in fixtures while the real API is still being built.',
  },
  {
    id: 4,
    userId: 1,
    title: 'Teaching HTTP status codes',
    body: 'Try /status/404, /status/500 and /status/418 to see how clients handle each code.',
  },
  {
    id: 5,
    userId: 4,
    title: 'Delaying requests to test loading states',
    body: '/delay/3 simulates a slow network so you can verify spinners and timeouts.',
  },
  {
    id: 6,
    userId: 5,
    title: 'Echoing request headers',
    body: '/headers returns exactly what your client sent — great for debugging proxies.',
  },
]
