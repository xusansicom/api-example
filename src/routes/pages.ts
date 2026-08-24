import type { Context, Hono } from 'hono'
import { faviconIcoBytes } from '../favicon'
import { docsPage, homePage, robotsTxt, sitemapXml } from '../html'

export function registerPageRoutes(app: Hono) {
  const origin = (c: Context) => new URL(c.req.url).origin

  app.get('/', (c) => c.html(homePage(origin(c))))
  app.get('/docs', (c) => c.html(docsPage(origin(c))))
  app.get('/robots.txt', (c) => c.text(robotsTxt(origin(c))))
  app.get('/sitemap.xml', (c) =>
    c.body(sitemapXml(origin(c)), 200, {
      'Content-Type': 'application/xml; charset=utf-8',
    }),
  )
  app.get('/favicon.ico', (c) =>
    c.body(faviconIcoBytes(), 200, {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=86400',
    }),
  )
}
