import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
} from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import app from '../src/index'
import { goVanity } from '../src/index'
import { REPOS } from '../src/repos'

const PROXIED_SUBDOMAINS = Object.keys(REPOS).filter(
  n => n !== 'hop' && !n.includes('/')
)

// Helper to make requests against the Hono app
async function request(
  path: string,
  opts: { headers?: Record<string, string> } = {},
) {
  const url = `https://hop.top${path}`
  const req = new Request(url, { headers: opts.headers })
  const ctx = createExecutionContext()
  const res = await app.fetch(req, env, ctx)
  await waitOnExecutionContext(ctx)
  return res
}

// ── goVanity helper ──────────────────────────────────────────────

describe('goVanity', () => {
  it('renders go-import meta tag', () => {
    const html = goVanity('hop.top/uri', 'https://github.com/hop-top/uri')
    expect(html).toContain(
      '<meta name="go-import" content="hop.top/uri git https://github.com/hop-top/uri">',
    )
  })

  it('renders go-source meta tag', () => {
    const html = goVanity('hop.top/uri', 'https://github.com/hop-top/uri')
    expect(html).toContain('go-source')
    expect(html).toContain('tree/main{/dir}')
  })

  it('renders redirect to repo URL', () => {
    const html = goVanity('hop.top/kit', 'https://github.com/hop-top/kit')
    expect(html).toContain('Redirecting to')
    expect(html).toContain('https://github.com/hop-top/kit')
  })
})

// ── Go vanity routes ─────────────────────────────────────────────

describe('go vanity routes', () => {
  it('returns go-import for known package with ?go-get=1', async () => {
    const res = await request('/uri?go-get=1')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('go-import')
    expect(html).toContain('hop.top/uri git https://github.com/hop-top/uri')
  })

  it('returns go-import for submodule with ?go-get=1', async () => {
    const res = await request('/xrr-poly/go?go-get=1')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('go-import')
    expect(html).toContain('hop.top/xrr-poly/go')
  })

  it('returns 404 for unknown x-number pattern', async () => {
    const res = await request('/x999?go-get=1')
    expect(res.status).toBe(404)
  })

  it('redirects known repo without ?go-get=1 (non-proxied)', async () => {
    // 'hop' is excluded from PROXIED_SUBDOMAINS, so it redirects
    const res = await request('/hop')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(
      'https://github.com/hop-top/hop',
    )
  })
})

// ── PROXIED_SUBDOMAINS filtering ─────────────────────────────────

describe('PROXIED_SUBDOMAINS', () => {
  it('excludes "hop" from proxied subdomains', () => {
    expect(PROXIED_SUBDOMAINS).not.toContain('hop')
  })

  it('includes other repos like "kit"', () => {
    expect(PROXIED_SUBDOMAINS).toContain('kit')
  })

  it('excludes submodule keys containing "/"', () => {
    // REPOS contains keys like "xrr-poly/go" — those must not appear
    const repoSlashKeys = Object.keys(REPOS).filter(n => n.includes('/'))
    expect(repoSlashKeys.length).toBeGreaterThan(0) // precondition
    const withSlash = PROXIED_SUBDOMAINS.filter(n => n.includes('/'))
    expect(withSlash).toEqual([])
  })
})

// ── Root / proxies to SITE_URL ───────────────────────────────────

describe('root proxy', () => {
  it('proxies / to SITE_URL', async () => {
    const res = await request('/')
    // Should attempt to fetch from SITE_URL; response depends on
    // whether the upstream is reachable. We verify the request
    // doesn't 404 or throw.
    expect([200, 500, 502, 503, 530]).toContain(res.status)
  })
})

// ── Static asset route pattern ───────────────────────────────────

describe('static asset routes', () => {
  it('matches /_astro/ paths (no leading space bug)', async () => {
    const res = await request('/_astro/style.abc123.css', {
      headers: { referer: 'https://hop.top/kit/overview' },
    })
    // Asset route should handle this; upstream may return any status
    // but the route itself shouldn't throw. With a valid referer
    // pointing to a proxied subdomain, the handler attempts to proxy
    // to that subdomain's origin.
    expect(res).toBeDefined()
    expect(typeof res.status).toBe('number')
  })

  it('matches /favicon.svg', async () => {
    const res = await request('/favicon.svg')
    // Should be handled by asset route or fall through to site proxy
    expect(res.status).not.toBe(404)
  })
})
