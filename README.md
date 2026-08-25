# api-example.com

> Stop inventing fake API URLs — use one that actually works.

**api-example.com** is a free, public, stateless example API for developers who
need a *real, reachable* endpoint to reference in documentation, SDK samples,
webhook tests, frontend demos, and CI. This repository is the complete source
behind the live service: a small, dependency-light Cloudflare Worker with no
database, no accounts, and no tracking.

Every developer has written `https://example.com/api/users` at some point — and
then discovered that URL returns a 404 or an HTML page. api-example.com fixes
that: the endpoints respond with real JSON, CORS is enabled for any origin,
there is no auth, and the response shapes are treated as a stable public API
contract.

## Features

- **Stable endpoints** — paths and response shapes are a public API contract; they do not change without a major version bump.
- **Zero setup** — no accounts, no database, no dashboards, no tracking, nothing persisted.
- **CORS for any origin** — call it directly from browsers, CodePen, or local frontends; `OPTIONS` preflights return 204.
- **Real responses** — `/users`, `/posts`, `/status/:code`, `/delay/:seconds`, `/anything`, and more, all live.
- **Tiny & portable** — [Hono](https://hono.dev) (~14 KB, zero deps) on Cloudflare Workers; the same app can run on other Hono-supported runtimes.
- **Security-minded** — per-IP rate limiting, 100 KB body cap, no SSRF, no uploads, no code execution, no open redirects.

## Live service

The production instance runs at **<https://api-example.com>**, deployed from
this repository. Use it as-is in docs, demos, and tests — or deploy your own
instance with the steps below.

## Endpoints

Base URL: `https://api-example.com`

| Method(s)                          | Path                       | Description                                                        |
| ---------------------------------- | -------------------------- | ------------------------------------------------------------------ |
| GET                                | `/json`                    | Simple stable JSON example                                         |
| GET                                | `/users`                   | Fixed list of 6 example users                                      |
| GET                                | `/users/:id`               | Single example user (404 if unknown)                               |
| GET                                | `/posts`                   | Fixed list of 6 example posts                                      |
| GET                                | `/posts/:id`               | Single example post (404 if unknown)                               |
| GET                                | `/status/:code`            | Returns any HTTP status 100–599                                    |
| GET                                | `/delay/:seconds`          | Delays 0–10 seconds before responding                              |
| GET                                | `/headers`                 | Echoes the request headers                                         |
| GET                                | `/ip`                      | Echoes the client IP (never stored)                                |
| GET                                | `/uuid`                    | Returns a fresh UUIDv4                                             |
| GET/POST/PUT/PATCH/DELETE          | `/anything`                | Echoes the full request (method, URL, query, headers, body)        |
| GET                                | `/` `/docs`                | Homepage and full API documentation                                |
| GET                                | `/robots.txt` `/sitemap.xml` | SEO files                                                        |

```bash
curl https://api-example.com/users/1
# {"id":1,"name":"Ada Lovelace","username":"ada","email":"ada@example.com"}
```

## Tech stack

| Layer     | Choice                      | Why                                                          |
| --------- | --------------------------- | ------------------------------------------------------------ |
| Runtime   | Cloudflare Workers          | Free tier, global edge, zero servers, deploy in seconds      |
| Framework | [Hono](https://hono.dev)    | ~14 KB, zero deps, first-class Workers support, portable to Vercel Edge / Deno Deploy |
| Language  | TypeScript (strict)         | Type safety with no runtime cost                             |
| Tests     | Vitest + Hono `app.request` | Runs in plain Node, no workerd needed, instant               |
| Pages     | Server-rendered HTML        | No framework, no JS bundle; light/dark via `prefers-color-scheme` |

## Getting started

Requires Node.js ≥ 20 and pnpm ≥ 10.

```bash
git clone https://github.com/inkjuncom/api-example.git
cd api-example
pnpm install        # install dependencies
pnpm run dev        # wrangler dev on http://localhost:8787
pnpm run test       # run the test suite (40 tests)
pnpm run typecheck  # tsc --noEmit
```

## Deployment

```bash
npx wrangler login   # authenticate once
pnpm run deploy      # deploy to <name>.<subdomain>.workers.dev
```

**Custom domain:** in the Cloudflare dashboard open your Worker →
*Settings → Domains & Routes* and add your domain (and `www` if desired). The
Worker serves everything — no separate Pages project needed.

## Project structure

```
├── src/
│   ├── index.ts          # Worker entry (default export)
│   ├── app.ts            # App assembly: middleware + route registration
│   ├── middleware.ts     # CORS, per-IP rate limit, 100 KB body limit
│   ├── data.ts           # Fixed, database-free users & posts
│   ├── html.ts           # Homepage, /docs, robots.txt, sitemap.xml (SSR HTML)
│   ├── favicon.ts        # Generated favicon bytes (32px + 16px ICO)
│   ├── lib/
│   │   ├── http.ts       # Unified error shape + status text
│   │   ├── ip.ts         # Client IP extraction
│   │   └── uuid.ts       # Dependency-free UUIDv4
│   └── routes/           # One module per endpoint group
│       ├── core.ts       # /json /uuid /headers /ip
│       ├── users.ts      # /users /users/:id
│       ├── posts.ts      # /posts /posts/:id
│       ├── status.ts     # /status/:code
│       ├── delay.ts      # /delay/:seconds
│       ├── anything.ts   # /anything (all methods)
│       ├── pages.ts      # / /docs /robots.txt /sitemap.xml
│       └── fallback.ts   # legacy path fallback + scanner 404
├── test/
│   └── app.test.ts       # 40 tests covering every endpoint
├── scripts/
│   └── gen-favicon.mjs   # regenerates src/favicon.ts (base64 ICO, pure Node)
├── wrangler.jsonc        # Worker config
├── tsconfig.json         # TypeScript strict
├── vitest.config.ts
└── package.json
```

## Security & resource controls

| Control                    | Implementation                                              |
| -------------------------- | ----------------------------------------------------------- |
| CORS                       | `Access-Control-Allow-Origin: *` + OPTIONS preflight (204). Future sensitive features must not inherit this. |
| Rate limit                 | 120 requests / minute per IP (in-memory, per-isolate). Returns 429 + `Retry-After`. |
| Delay cap                  | `/delay` max 10 seconds, otherwise 400.                     |
| Body limit                 | 100 KB streaming limit on all mutating methods, otherwise 413. |
| No SSRF / proxy            | No arbitrary URL fetching anywhere.                         |
| No uploads / hosting       | No file storage.                                            |
| No code execution          | Static handlers only.                                       |
| No open redirects          | No redirect endpoints at all.                               |
| Privacy                    | IPs and bodies are never persisted or logged. `/ip` only echoes. |
| Error format               | Every error: `{ "success": false, "error", "message", "path" }`. |

### Rate limiting note

The default limiter is a per-isolate in-memory fixed window. Cloudflare runs
many isolates, so this is an approximation — fine for basic abuse prevention
on a free public service. For strict global limits, swap the middleware for a
KV-backed counter (a `RATE_LIMIT_KV` binding + `KVNamespace`), a ~30-line
change confined to `src/middleware.ts`.

## Legacy URL compatibility

This domain has been used as a placeholder API in the past, so unknown paths
are **not** blindly 404'd. Historical-style paths (`/v1/*`, `/v2/*`, `/api/*`,
`/login`, `/foo`, `/article`, …) return a friendly 200 JSON:

```json
{
  "message": "This is api-example.com.",
  "path": "/v2/example",
  "tip": "Use /anything to inspect requests or visit /docs for available endpoints."
}
```

Paths that clearly look like automated vulnerability scans (`.env`, `.git`,
`wp-*`, `.php`, `.sql`, `actuator`, …) get a plain 404.

## Stability promise

- Endpoint paths and response shapes are treated as public API — they will not
  change without a major version bump.
- No accounts, no database, no dashboards. If this ever grows, the added
  surface is opt-in, never a breaking change to the core endpoints.

## Contributing

Contributions are welcome! Open an issue to discuss a change before sending a
pull request, and keep in mind:

- Endpoint paths and response shapes are a **public API contract** — changing
  them is a breaking change and needs discussion first.
- The service runs on Cloudflare's free tier — new features must stay cheap to
  operate (no databases, no external services).
- All code is TypeScript strict; `pnpm run typecheck` and `pnpm run test` must
  pass.

## License

This project is released under the [MIT License](./LICENSE).
