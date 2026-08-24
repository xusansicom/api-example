import type { Hono } from 'hono'
import { errorBody } from '../lib/http'

// Paths that look like automated vulnerability scans get a plain 404.
// Everything else falls through to a friendly, link-preserving response.
const SCANNER_PATTERNS = [
  // Credential / VCS / secret probing
  /\.env$/i,
  /\.git/i,
  /\.svn/i,
  /\.hg/i,
  /\.aws/i,
  /\.ssh/i,
  /passwd/i,
  /shadow/i,
  // Backup / config file extensions
  /\.(php|asp|aspx|jsp|sql|bak|old|swp|tar|gz|zip|rar|7z|conf|ini|log)$/i,
  // CMS / framework probes
  /wp-/i,
  /wordpress/i,
  /xmlrpc/i,
  /phpmyadmin/i,
  /(^|\/)pma(\/|$)/i,
  /actuator/i,
  /solr/i,
  /jenkins/i,
  /vendor/i,
  /node_modules/i,
  /cgi-bin/i,
]

export function isScannerPath(path: string): boolean {
  return SCANNER_PATTERNS.some((re) => re.test(path))
}

export function registerFallback(app: Hono) {
  app.notFound((c) => {
    if (isScannerPath(c.req.path)) {
      return c.json(errorBody(404, 'Not Found.', c.req.path), 404)
    }

    // Historical placeholder paths (/v1/*, /v2/*, /api/*, /login, /foo, ...)
    // stay reachable so old links keep working.
    return c.json({
      message: 'This is api-example.com.',
      path: c.req.path,
      tip: 'Use /anything to inspect requests or visit /docs for available endpoints.',
    })
  })
}
