// Server-rendered pages: homepage, /docs, robots.txt, sitemap.xml.
// Deliberately framework-free: static HTML + a few lines of inline CSS,
// with light/dark support via prefers-color-scheme and copy buttons
// added by a tiny inline script.

const EXAMPLE_ORIGIN = 'https://api-example.com'

const CSS = `
:root {
  --bg: #ffffff; --fg: #18181b; --muted: #5f6470;
  --accent: #0a7ea4; --accent-soft: rgba(10, 126, 164, 0.10);
  --border: #e4e4e7; --code-bg: #f6f7f9;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f1115; --fg: #e6e6e6; --muted: #9aa0ac;
    --accent: #4cc2ff; --accent-soft: rgba(76, 194, 255, 0.12);
    --border: #26292f; --code-bg: #161a20;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--fg);
  font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
main { max-width: 820px; margin: 0 auto; padding: 32px 20px 80px; }
h1 { font-size: clamp(30px, 6.5vw, 50px); letter-spacing: -0.03em; line-height: 1.08; margin: 0 0 14px; font-weight: 800; }
h2 { font-size: 21px; margin: 44px 0 14px; letter-spacing: -0.01em; }
h3 { font-size: 16px; margin: 30px 0 8px; }
p { margin: 0 0 16px; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.accent { color: var(--accent); }
.quiet { color: var(--muted); }

/* header */
.site-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 52px; }
.brand { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 700; font-size: 17px; letter-spacing: -0.02em; color: var(--fg); }
.brand-accent { color: var(--accent); }
.site-nav a { margin-left: 18px; font-size: 14px; }

/* hero */
.hero { margin-bottom: 12px; }
.eyebrow { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
.tagline { font-size: 18px; color: var(--muted); max-width: 600px; }

/* terminal */
.terminal { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin: 30px 0 44px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07); }
.terminal-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: var(--code-bg); border-bottom: 1px solid var(--border); }
.dot { width: 11px; height: 11px; border-radius: 50%; flex: none; }
.dot-red { background: #ff5f57; } .dot-yellow { background: #febc2e; } .dot-green { background: #28c840; }
.terminal-title { margin-left: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.terminal pre { border: none; border-radius: 0; margin: 0; }

/* code */
pre {
  position: relative; background: var(--code-bg); border: 1px solid var(--border); border-radius: 10px;
  padding: 14px 16px; overflow-x: auto; font-size: 13.5px; line-height: 1.55; margin: 12px 0 20px;
}
code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
:not(pre) > code { background: var(--code-bg); border: 1px solid var(--border); border-radius: 5px; padding: 1px 5px; font-size: 0.88em; }
.copy-btn {
  position: absolute; top: 8px; right: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px; padding: 3px 10px; border-radius: 6px; border: 1px solid var(--border);
  background: var(--bg); color: var(--muted); cursor: pointer; opacity: 0.85;
}
.copy-btn:hover { color: var(--fg); border-color: var(--accent); opacity: 1; }

/* pills */
.pills { display: flex; flex-wrap: wrap; gap: 8px; }
.pills a { border: 1px solid var(--border); border-radius: 999px; padding: 6px 14px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13.5px; color: var(--fg); }
.pills a:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

/* cards */
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.card { border: 1px solid var(--border); border-radius: 12px; padding: 18px 18px 16px; background: var(--accent-soft); border-color: transparent; }
.card h3 { margin: 0 0 8px; font-size: 15px; }
.card p { margin: 0; font-size: 14px; color: var(--muted); }

/* endpoint cards */
.endpoint-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(235px, 1fr)); gap: 10px; margin: 16px 0; }
.endpoint-card { border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 5px; color: var(--fg); }
.endpoint-card:hover { border-color: var(--accent); text-decoration: none; }
.endpoint-path { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 700; font-size: 15px; }
.endpoint-desc { font-size: 13px; color: var(--muted); }

/* badges & tables (docs) */
.badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; margin-right: 8px; vertical-align: 2px; letter-spacing: 0.02em; }
.badge.get { background: #dbeafe; color: #1d4ed8; }
.badge.post { background: #dcfce7; color: #15803d; }
.badge.put { background: #fef3c7; color: #b45309; }
.badge.patch { background: #fae8ff; color: #a21caf; }
.badge.delete { background: #fee2e2; color: #b91c1c; }
.badge.all { background: #e0e7ff; color: #4338ca; }
table { border-collapse: collapse; width: 100%; font-size: 14px; margin: 12px 0 24px; }
th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
th { background: var(--code-bg); font-weight: 600; }
.endpoint { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 600; }

footer { color: var(--muted); font-size: 13.5px; margin-top: 56px; border-top: 1px solid var(--border); padding-top: 18px; }
`

const COPY_SCRIPT = `<script>
document.querySelectorAll('pre').forEach(function (pre) {
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'copy-btn'; btn.textContent = 'Copy';
  btn.setAttribute('aria-label', 'Copy code to clipboard');
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(pre.textContent).then(function () {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
    });
  });
  pre.appendChild(btn);
});
</script>`

function layout(opts: {
  title: string
  description: string
  canonical: string
  body: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${opts.title}</title>
<meta name="description" content="${opts.description}">
<link rel="canonical" href="${opts.canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${opts.title}">
<meta property="og:description" content="${opts.description}">
<meta property="og:url" content="${opts.canonical}">
<meta name="twitter:card" content="summary">
<style>${CSS}</style>
</head>
<body>
<main>
${opts.body}
</main>
${COPY_SCRIPT}
</body>
</html>`
}

function siteHeader(active: 'home' | 'docs'): string {
  return `
<header class="site-head">
  <a class="brand" href="/">api-example<span class="brand-accent">.com</span></a>
  <nav class="site-nav">
    <a href="/docs"${active === 'docs' ? ' style="text-decoration:underline"' : ''}>Docs</a>
    <a href="#endpoints">Endpoints</a>
  </nav>
</header>`
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

interface HomeEndpoint {
  method: 'GET' | 'POST' | 'ALL'
  path: string
  desc: string
}

const HOME_ENDPOINTS: HomeEndpoint[] = [
  { method: 'GET', path: '/json', desc: 'Stable JSON example' },
  { method: 'GET', path: '/users', desc: 'List of example users' },
  { method: 'GET', path: '/users/1', desc: 'Single example user' },
  { method: 'GET', path: '/posts', desc: 'List of example posts' },
  { method: 'GET', path: '/posts/1', desc: 'Single example post' },
  { method: 'GET', path: '/status/404', desc: 'Return any HTTP status' },
  { method: 'GET', path: '/delay/3', desc: 'Simulate slow network' },
  { method: 'GET', path: '/headers', desc: 'Echo request headers' },
  { method: 'GET', path: '/ip', desc: 'Echo client IP' },
  { method: 'GET', path: '/uuid', desc: 'Fresh UUIDv4' },
  { method: 'ALL', path: '/anything', desc: 'Echo any request' },
]

function endpointAnchor(path: string): string {
  return path.replace(/[^a-zA-Z0-9]+/g, '-')
}

export function homePage(origin: string): string {
  const canonical = `${origin}/`
  const endpointCards = HOME_ENDPOINTS.map(
    (e) => `
  <a class="endpoint-card" href="/docs#${endpointAnchor(e.path)}">
    <span><span class="badge ${e.method === 'GET' ? 'get' : 'all'}">${e.method}</span><span class="endpoint-path">${e.path}</span></span>
    <span class="endpoint-desc">${e.desc}</span>
  </a>`,
  ).join('')

  return layout({
    title: 'api-example.com — An example API that actually works',
    description:
      'A free, public example API for docs, demos, tests and tutorials. Stop inventing fake API URLs — use api-example.com.',
    canonical,
    body: `
${siteHeader('home')}

<section class="hero">
  <p class="eyebrow"><span class="accent">api-example.com</span> — a free public example API</p>
  <h1>An example API that actually works.</h1>
  <p class="tagline">Stop inventing fake API URLs. Use api-example.com in docs, demos, tests, and tutorials.</p>
</section>

<div class="terminal">
  <div class="terminal-bar">
    <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
    <span class="terminal-title">GET ${EXAMPLE_ORIGIN}/users/1</span>
  </div>
  <pre><code>$ curl ${EXAMPLE_ORIGIN}/users/1

{
  "id": 1,
  "name": "Ada Lovelace",
  "username": "ada",
  "email": "ada@example.com"
}</code></pre>
</div>

<section class="quick">
  <h2>Try it now</h2>
  <div class="pills">
    <a href="/users">/users</a>
    <a href="/posts">/posts</a>
    <a href="/json">/json</a>
    <a href="/status/404">/status/404</a>
    <a href="/delay/3">/delay/3</a>
    <a href="/headers">/headers</a>
    <a href="/anything">/anything</a>
  </div>
</section>

<section class="why">
  <h2>Why api-example.com?</h2>
  <div class="cards">
    <div class="card">
      <h3>It actually works</h3>
      <p>Every endpoint responds with real JSON — no 404s, no HTML error pages. Paste it in your docs and it just works.</p>
    </div>
    <div class="card">
      <h3>Free for everyone</h3>
      <p>No accounts, no API keys, no signup. Call it from curl, browsers, CI pipelines, or server code.</p>
    </div>
    <div class="card">
      <h3>CORS enabled</h3>
      <p><code>Access-Control-Allow-Origin: *</code> — call it directly from any frontend, CodePen, or local dev page.</p>
    </div>
    <div class="card">
      <h3>Stable URLs</h3>
      <p>Endpoint paths are treated as public API and won't change. Safe to link from READMEs and Stack Overflow.</p>
    </div>
  </div>
</section>

<section id="endpoints" class="endpoints">
  <h2>Endpoints</h2>
  <div class="endpoint-grid">
${endpointCards}
  </div>
  <p class="quiet">Full reference with curl, JavaScript and Python examples → <a href="/docs">the docs</a>.</p>
</section>

<footer>api-example.com · Free public example API · No accounts, no tracking, no data collection.<br>
<a href="/docs">Docs</a> · <a href="/robots.txt">robots.txt</a> · <a href="/sitemap.xml">Sitemap</a></footer>`,
  })
}

// ---------------------------------------------------------------------------
// Docs
// ---------------------------------------------------------------------------

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'ALL'
  path: string
  desc: string
  curl: string
  response: string
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/json',
    desc: 'A simple, stable JSON example you can paste anywhere.',
    curl: `curl ${EXAMPLE_ORIGIN}/json`,
    response: `{
  "message": "Hello from api-example.com",
  "success": true
}`,
  },
  {
    method: 'GET',
    path: '/users',
    desc: 'A fixed list of example users. No database behind it.',
    curl: `curl ${EXAMPLE_ORIGIN}/users`,
    response: `[
  { "id": 1, "name": "Ada Lovelace", "username": "ada", "email": "ada@example.com" },
  { "id": 2, "name": "Alan Turing", "username": "alan", "email": "alan@example.com" },
  { "id": 3, "name": "Grace Hopper", "username": "grace", "email": "grace@example.com" }
]`,
  },
  {
    method: 'GET',
    path: '/users/:id',
    desc: 'A single example user. Unknown ids return 404.',
    curl: `curl ${EXAMPLE_ORIGIN}/users/1`,
    response: `{
  "id": 1,
  "name": "Ada Lovelace",
  "username": "ada",
  "email": "ada@example.com"
}`,
  },
  {
    method: 'GET',
    path: '/posts',
    desc: 'A fixed list of example posts.',
    curl: `curl ${EXAMPLE_ORIGIN}/posts`,
    response: `[
  { "id": 1, "userId": 1, "title": "Getting started with api-example.com", "body": "..." },
  { "id": 2, "userId": 2, "title": "How to test a webhook endpoint", "body": "..." }
]`,
  },
  {
    method: 'GET',
    path: '/posts/:id',
    desc: 'A single example post. Unknown ids return 404.',
    curl: `curl ${EXAMPLE_ORIGIN}/posts/1`,
    response: `{
  "id": 1,
  "userId": 1,
  "title": "Getting started with api-example.com",
  "body": "Stop inventing fake API URLs. Use one that works."
}`,
  },
  {
    method: 'GET',
    path: '/status/:code',
    desc: 'Returns the HTTP status code given in the URL, with a small JSON body. Useful for testing error handling.',
    curl: `curl -i ${EXAMPLE_ORIGIN}/status/404`,
    response: `HTTP/1.1 404 Not Found

{
  "success": false,
  "status": 404,
  "message": "Not Found",
  "path": "/status/404"
}`,
  },
  {
    method: 'GET',
    path: '/delay/:seconds',
    desc: 'Waits the given number of seconds before responding. Capped at 10 seconds.',
    curl: `curl ${EXAMPLE_ORIGIN}/delay/3`,
    response: `{
  "success": true,
  "message": "Delayed by 3 seconds.",
  "seconds": 3,
  "timestamp": "2026-08-24T00:00:00.000Z"
}`,
  },
  {
    method: 'GET',
    path: '/headers',
    desc: 'Echoes back the headers your client sent.',
    curl: `curl -H "X-Custom: hello" ${EXAMPLE_ORIGIN}/headers`,
    response: `{
  "headers": {
    "accept": "*/*",
    "user-agent": "curl/8.9.1",
    "x-custom": "hello"
  }
}`,
  },
  {
    method: 'GET',
    path: '/ip',
    desc: 'Echoes back your IP address. Nothing is stored or logged.',
    curl: `curl ${EXAMPLE_ORIGIN}/ip`,
    response: `{
  "ip": "203.0.113.7"
}`,
  },
  {
    method: 'GET',
    path: '/uuid',
    desc: 'Returns a fresh UUIDv4 on every call.',
    curl: `curl ${EXAMPLE_ORIGIN}/uuid`,
    response: `{
  "uuid": "1f2a3b4c-5d6e-4f80-9a1b-2c3d4e5f6071"
}`,
  },
  {
    method: 'ALL',
    path: '/anything',
    desc: 'The debugging endpoint. Echoes the method, URL, query string, headers and body of any request.',
    curl: `curl -X POST ${EXAMPLE_ORIGIN}/anything \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Ada"}'`,
    response: `{
  "method": "POST",
  "url": "https://api-example.com/anything",
  "query": {},
  "headers": {
    "accept": "*/*",
    "content-type": "application/json",
    "user-agent": "curl/8.9.1"
  },
  "body": { "name": "Ada" },
  "timestamp": "2026-08-24T00:00:00.000Z"
}`,
  },
]

const BADGE_CLASS: Record<EndpointDoc['method'], string> = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
  ALL: 'all',
}

function endpointSection(doc: EndpointDoc): string {
  return `
<h3 id="${endpointAnchor(doc.path)}">
  <span class="badge ${BADGE_CLASS[doc.method]}">${doc.method}</span>
  <span class="endpoint">${doc.path}</span>
</h3>
<p>${doc.desc}</p>
<pre><code>${doc.curl}</code></pre>
<pre><code>${doc.response}</code></pre>`
}

export function docsPage(origin: string): string {
  const canonical = `${origin}/docs`
  const tableRows = ENDPOINTS.map(
    (e) =>
      `<tr><td><span class="badge ${BADGE_CLASS[e.method]}">${e.method}</span></td>` +
      `<td><a class="endpoint" href="${e.path}">${e.path}</a></td><td>${e.desc}</td></tr>`,
  ).join('\n')

  return layout({
    title: 'API Documentation — api-example.com',
    description:
      'Full API reference for api-example.com: /json, /users, /posts, /status/:code, /delay/:seconds, /headers, /ip, /uuid and /anything with curl, fetch and Python examples.',
    canonical,
    body: `
${siteHeader('docs')}

<h1>API Documentation</h1>
<p class="tagline">A free example API that actually works. Every endpoint below is live
— open any link or run the <code>curl</code> command.</p>

<h2>Endpoints</h2>
<table>
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody>
${tableRows}
</tbody>
</table>

<h2 id="endpoint-details">Endpoint details</h2>
${ENDPOINTS.map(endpointSection).join('\n')}

<h2 id="post-json">POST JSON example</h2>
<p>Send a JSON body and inspect exactly what arrived.</p>
<pre><code>curl -X POST ${EXAMPLE_ORIGIN}/anything \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Ada", "role": "engineer"}'

{
  "method": "POST",
  "url": "https://api-example.com/anything",
  "query": {},
  "headers": { "content-type": "application/json", "user-agent": "curl/8.9.1" },
  "body": { "name": "Ada", "role": "engineer" },
  "timestamp": "2026-08-24T00:00:00.000Z"
}</code></pre>

<h2 id="http-status">HTTP status testing</h2>
<p>Return any status code to test how your client handles errors, retries and redirects:</p>
<pre><code>curl -i ${EXAMPLE_ORIGIN}/status/200   # 200 OK
curl -i ${EXAMPLE_ORIGIN}/status/404   # 404 Not Found
curl -i ${EXAMPLE_ORIGIN}/status/500   # 500 Internal Server Error
curl -i ${EXAMPLE_ORIGIN}/status/418   # 418 I'm a teapot</code></pre>

<h2 id="javascript">JavaScript (fetch)</h2>
<pre><code>// GET example
const user = await fetch("${EXAMPLE_ORIGIN}/users/1").then((r) => r.json())
console.log(user.name) // "Ada Lovelace"

// POST example
const res = await fetch("${EXAMPLE_ORIGIN}/anything", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hello: "world" }),
})
console.log(await res.json())</code></pre>

<h2 id="python">Python (requests)</h2>
<pre><code>import requests

# GET example
user = requests.get("${EXAMPLE_ORIGIN}/users/1").json()
print(user["name"])  # Ada Lovelace

# POST example
echo = requests.post("${EXAMPLE_ORIGIN}/anything", json={"hello": "world"}).json()
print(echo["body"])  # {'hello': 'world'}</code></pre>

<h2 id="cors">CORS &amp; browser usage</h2>
<p>All endpoints send <code>Access-Control-Allow-Origin: *</code> and answer
<code>OPTIONS</code> preflight requests, so you can call them directly from any
browser page, CodePen, or local frontend without a proxy.</p>

<h2 id="limits">Limits &amp; policy</h2>
<ul>
<li><code>/delay</code> is capped at <strong>10 seconds</strong>.</li>
<li>Request bodies are limited to <strong>100 KB</strong> (413 otherwise).</li>
<li>Basic per-IP rate limit: <strong>120 requests / minute</strong> (429 otherwise, with <code>Retry-After</code>).</li>
<li>No SSRF, no arbitrary proxying, no file uploads, no stored data.</li>
<li>IP addresses are never persisted or logged; request bodies are never stored.</li>
</ul>

<h2 id="legacy">Historical paths</h2>
<p>This domain has been used as a placeholder API in the past. Unknown paths such as
<code>/v1/...</code>, <code>/v2/...</code>, <code>/api/...</code>, <code>/login</code>,
<code>/foo</code> or <code>/article</code> return a friendly JSON payload instead of a
broken link, so old documentation keeps working.</p>

<footer>api-example.com · Free public example API · No accounts, no tracking, no data collection.<br>
<a href="/">Home</a> · <a href="/sitemap.xml">Sitemap</a></footer>`,
  })
}

// ---------------------------------------------------------------------------
// robots.txt / sitemap.xml
// ---------------------------------------------------------------------------

export function robotsTxt(origin: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`
}

export function sitemapXml(origin: string): string {
  const today = '2026-08-24'
  const urls = [
    ['/', 'weekly', '1.0'],
    ['/docs', 'weekly', '0.9'],
    ['/json', 'yearly', '0.6'],
    ['/users', 'yearly', '0.6'],
    ['/users/1', 'yearly', '0.5'],
    ['/posts', 'yearly', '0.6'],
    ['/posts/1', 'yearly', '0.5'],
    ['/status/200', 'yearly', '0.5'],
    ['/status/404', 'yearly', '0.5'],
    ['/delay/1', 'yearly', '0.5'],
    ['/headers', 'yearly', '0.5'],
    ['/ip', 'yearly', '0.5'],
    ['/uuid', 'yearly', '0.5'],
    ['/anything', 'yearly', '0.6'],
  ] as const

  const entries = urls
    .map(
      ([path, freq, priority]) =>
        `  <url><loc>${origin}${path}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}
