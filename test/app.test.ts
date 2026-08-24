import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'

const BASE = 'https://api-example.test'

// Most tests run without rate limiting so they are deterministic.
const app = createApp({ rateLimit: false })

function request(path: string, init?: RequestInit) {
  return app.request(BASE + path, init)
}

describe('GET /json', () => {
  it('returns the stable greeting', async () => {
    const res = await request('/json')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/json')
    const body = await res.json()
    expect(body).toEqual({
      message: 'Hello from api-example.com',
      success: true,
    })
  })
})

describe('GET /users', () => {
  it('returns 5-10 example users', async () => {
    const res = await request('/users')
    expect(res.status).toBe(200)
    const users = (await res.json()) as Array<{ id: number }>
    expect(users.length).toBeGreaterThanOrEqual(5)
    expect(users.length).toBeLessThanOrEqual(10)
    expect(users[0].id).toBe(1)
  })

  it('returns a single user by id', async () => {
    const res = await request('/users/1')
    expect(res.status).toBe(200)
    const user = (await res.json()) as { id: number; name: string }
    expect(user.id).toBe(1)
    expect(typeof user.name).toBe('string')
  })

  it('returns 404 for unknown users', async () => {
    const res = await request('/users/999')
    expect(res.status).toBe(404)
    const body = (await res.json()) as { success: boolean; path: string }
    expect(body.success).toBe(false)
    expect(body.path).toBe('/users/999')
  })

  it('returns 404 for non-numeric ids', async () => {
    expect((await request('/users/abc')).status).toBe(404)
  })
})

describe('GET /posts', () => {
  it('returns a list of posts', async () => {
    const res = await request('/posts')
    expect(res.status).toBe(200)
    const posts = (await res.json()) as Array<{ id: number; title: string }>
    expect(posts.length).toBeGreaterThanOrEqual(5)
    expect(typeof posts[0].title).toBe('string')
  })

  it('returns a single post by id', async () => {
    const res = await request('/posts/1')
    expect(res.status).toBe(200)
    expect(((await res.json()) as { id: number }).id).toBe(1)
  })

  it('returns 404 for unknown posts', async () => {
    expect((await request('/posts/999')).status).toBe(404)
  })
})

describe('GET /status/:code', () => {
  it('returns 200 for /status/200', async () => {
    const res = await request('/status/200')
    expect(res.status).toBe(200)
    expect(((await res.json()) as { status: number }).status).toBe(200)
  })

  it('returns 404 for /status/404', async () => {
    const res = await request('/status/404')
    expect(res.status).toBe(404)
    const body = (await res.json()) as { status: number; message: string }
    expect(body.status).toBe(404)
    expect(body.message).toBe('Not Found')
  })

  it('returns 500 for /status/500', async () => {
    const res = await request('/status/500')
    expect(res.status).toBe(500)
    expect(((await res.json()) as { status: number }).status).toBe(500)
  })

  it('rejects out-of-range codes', async () => {
    expect((await request('/status/999')).status).toBe(400)
    expect((await request('/status/abc')).status).toBe(400)
  })
})

describe('GET /delay/:seconds', () => {
  it('delays and then returns 200', async () => {
    const started = Date.now()
    const res = await request('/delay/1')
    const elapsed = Date.now() - started
    expect(res.status).toBe(200)
    expect(elapsed).toBeGreaterThanOrEqual(900)
    const body = (await res.json()) as { message: string; seconds: number }
    expect(body.seconds).toBe(1)
    expect(body.message).toContain('Delayed by 1 second')
  })

  it('rejects delays above 10 seconds', async () => {
    expect((await request('/delay/11')).status).toBe(400)
  })

  it('rejects non-numeric delays', async () => {
    expect((await request('/delay/abc')).status).toBe(400)
    expect((await request('/delay/-1')).status).toBe(400)
  })
})

describe('GET /headers', () => {
  it('echoes the request headers', async () => {
    const res = await request('/headers', {
      headers: { 'x-test-header': 'yes', accept: 'application/json' },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { headers: Record<string, string> }
    expect(body.headers['x-test-header']).toBe('yes')
    expect(body.headers['accept']).toBe('application/json')
  })
})

describe('GET /ip', () => {
  it('echoes the client IP from x-forwarded-for', async () => {
    const res = await request('/ip', {
      headers: { 'x-forwarded-for': '203.0.113.7' },
    })
    expect(res.status).toBe(200)
    expect(((await res.json()) as { ip: string }).ip).toBe('203.0.113.7')
  })

  it('prefers cf-connecting-ip when present', async () => {
    const res = await request('/ip', {
      headers: {
        'cf-connecting-ip': '198.51.100.9',
        'x-forwarded-for': '203.0.113.7',
      },
    })
    expect(((await res.json()) as { ip: string }).ip).toBe('198.51.100.9')
  })
})

describe('GET /uuid', () => {
  it('returns a valid UUIDv4', async () => {
    const res = await request('/uuid')
    expect(res.status).toBe(200)
    const { uuid } = (await res.json()) as { uuid: string }
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('returns a fresh uuid on every call', async () => {
    const a = (await (await request('/uuid')).json()) as { uuid: string }
    const b = (await (await request('/uuid')).json()) as { uuid: string }
    expect(a.uuid).not.toBe(b.uuid)
  })
})

describe('/anything', () => {
  it('echoes POST body and metadata', async () => {
    const res = await request('/anything', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Ada', role: 'engineer' }),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      method: string
      url: string
      query: Record<string, string>
      body: { name: string; role: string }
      timestamp: string
    }
    expect(body.method).toBe('POST')
    expect(body.url).toContain('/anything')
    expect(body.body).toEqual({ name: 'Ada', role: 'engineer' })
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('echoes query parameters', async () => {
    const res = await request('/anything?foo=bar&n=42')
    const body = (await res.json()) as { query: Record<string, string> }
    expect(body.query).toEqual({ foo: 'bar', n: '42' })
  })

  it('supports PUT, PATCH and DELETE', async () => {
    for (const method of ['PUT', 'PATCH', 'DELETE'] as const) {
      const res = await request('/anything', { method })
      expect(res.status).toBe(200)
      expect(((await res.json()) as { method: string }).method).toBe(method)
    }
  })

  it('returns raw text body when JSON parsing fails', async () => {
    const res = await request('/anything', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'plain text body',
    })
    const body = (await res.json()) as { body: unknown }
    expect(body.body).toBe('plain text body')
  })

  it('parses urlencoded form bodies', async () => {
    const res = await request('/anything', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'a=1&b=two',
    })
    const body = (await res.json()) as { body: Record<string, string> }
    expect(body.body).toEqual({ a: '1', b: 'two' })
  })
})

describe('CORS', () => {
  it('answers OPTIONS preflight with 204 and allow-origin *', async () => {
    const res = await request('/anything', {
      method: 'OPTIONS',
      headers: {
        origin: 'https://example.org',
        'access-control-request-method': 'POST',
      },
    })
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('sends allow-origin * on normal responses', async () => {
    const res = await request('/json')
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('sends allow-origin * on error responses too', async () => {
    const res = await request('/users/999')
    expect(res.status).toBe(404)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})

describe('body size limit', () => {
  it('rejects bodies over 100 KB with 413', async () => {
    const res = await request('/anything', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload: 'x'.repeat(150 * 1024) }),
    })
    expect(res.status).toBe(413)
    const body = (await res.json()) as { success: boolean; error: string }
    expect(body.success).toBe(false)
    expect(body.error).toBe('Payload Too Large')
  })

  it('accepts bodies under the limit', async () => {
    const res = await request('/anything', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload: 'x'.repeat(1024) }),
    })
    expect(res.status).toBe(200)
  })
})

describe('legacy path fallback', () => {
  it('returns a friendly payload for historical paths', async () => {
    for (const path of [
      '/v2/example',
      '/v1/users',
      '/api/auth/login',
      '/login',
      '/foo',
      '/article',
    ]) {
      const res = await request(path)
      expect(res.status).toBe(200)
      const body = (await res.json()) as { message: string; path: string; tip: string }
      expect(body.message).toBe('This is api-example.com.')
      expect(body.path).toBe(path)
      expect(body.tip).toContain('/anything')
    }
  })

  it('still returns 404 for scanner-like paths', async () => {
    for (const path of ['/.env', '/.git/config', '/wp-admin/', '/xmlrpc.php', '/admin.php']) {
      const res = await request(path)
      expect(res.status).toBe(404)
      expect(((await res.json()) as { success: boolean }).success).toBe(false)
    }
  })
})

describe('pages and SEO', () => {
  it('serves the homepage as HTML', async () => {
    const res = await request('/')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    const html = await res.text()
    expect(html).toContain('api-example.com')
    expect(html).toContain('An example API that actually works')
  })

  it('serves /docs with endpoint links', async () => {
    const res = await request('/docs')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('href="/users"')
    expect(html).toContain('href="/anything"')
    expect(html).toContain('curl')
    expect(html).toContain('Python')
  })

  it('serves robots.txt pointing at the sitemap', async () => {
    const res = await request('/robots.txt')
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('User-agent: *')
    expect(text).toContain('Sitemap:')
  })

  it('serves a valid sitemap.xml', async () => {
    const res = await request('/sitemap.xml')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/xml')
    const text = await res.text()
    expect(text).toContain('<urlset')
    expect(text).toContain('<loc>')
    expect(text).toContain('/users')
  })
})

describe('rate limiting', () => {
  it('returns 429 with Retry-After after the limit', async () => {
    const limited = createApp({ rateLimit: { limit: 3, windowSeconds: 60 } })
    for (let i = 0; i < 3; i++) {
      const res = await limited.request(BASE + '/json', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      })
      expect(res.status).toBe(200)
    }
    const blocked = await limited.request(BASE + '/json', {
      headers: { 'x-forwarded-for': '10.0.0.1' },
    })
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('retry-after')).toBeTruthy()
    expect(blocked.headers.get('x-ratelimit-remaining')).toBe('0')
    expect(((await blocked.json()) as { success: boolean }).success).toBe(false)
  })

  it('tracks different IPs independently', async () => {
    const limited = createApp({ rateLimit: { limit: 2, windowSeconds: 60 } })
    await limited.request(BASE + '/json', { headers: { 'x-forwarded-for': '10.0.0.2' } })
    await limited.request(BASE + '/json', { headers: { 'x-forwarded-for': '10.0.0.2' } })
    const other = await limited.request(BASE + '/json', {
      headers: { 'x-forwarded-for': '10.0.0.3' },
    })
    expect(other.status).toBe(200)
  })
})
