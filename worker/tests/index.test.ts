import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
  fetchMock,
} from 'cloudflare:test'
import { beforeAll, afterEach, describe, it, expect } from 'vitest'
import app, { goVanity, isSpecName, resolveRepoUrl } from '../src/index'

const TAP = 'https://raw.githubusercontent.com'
const tapPath = (pkg: string) => `/hop-top/homebrew-tap/main/${pkg}.rb`
const RAW = 'https://raw.githubusercontent.com'
const specPath = (name: string, version: string, file: string) =>
  `/hop-top/spec-${name}/main/specs/${version}/${file}`

async function request(
  path: string,
  opts: { headers?: Record<string, string>; host?: string } = {},
) {
  const url = `https://${opts.host ?? 'hop.top'}${path}`
  const req = new Request(url, { headers: opts.headers })
  const ctx = createExecutionContext()
  const res = await app.fetch(req, env, ctx)
  await waitOnExecutionContext(ctx)
  return res
}

beforeAll(() => {
  fetchMock.activate()
  fetchMock.disableNetConnect()
})
afterEach(() => {
  fetchMock.assertNoPendingInterceptors()
})

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

// ── resolveRepoUrl: homebrew lookup + convention fallback ────────

describe('resolveRepoUrl', () => {
  it('returns homepage from a known homebrew formula', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('usp') }).reply(
      200,
      'class Usp < Formula\n  homepage "https://github.com/hop-top/usp"\nend\n',
    )
    expect(await resolveRepoUrl('usp')).toBe('https://github.com/hop-top/usp')
  })

  it('honors a non-default homepage in the formula', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('special') }).reply(
      200,
      'class Special < Formula\n  homepage "https://github.com/some-org/special-fork"\nend\n',
    )
    expect(await resolveRepoUrl('special')).toBe(
      'https://github.com/some-org/special-fork',
    )
  })

  it('falls back to convention when no formula exists (404)', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('no-formula') }).reply(404, '')
    expect(await resolveRepoUrl('no-formula')).toBe(
      'https://github.com/hop-top/no-formula',
    )
  })

  it('falls back to convention when formula parse misses', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('weird') }).reply(
      200,
      'class Weird < Formula\n  # no homepage line at all\nend\n',
    )
    expect(await resolveRepoUrl('weird')).toBe(
      'https://github.com/hop-top/weird',
    )
  })

  it('falls back to convention on network error', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('boom') })
      .replyWithError(new Error('network'))
    expect(await resolveRepoUrl('boom')).toBe('https://github.com/hop-top/boom')
  })
})

// ── Go vanity routes ─────────────────────────────────────────────

describe('go vanity routes', () => {
  it('returns go-import for any single-segment package', async () => {
    const res = await request('/some-new-repo?go-get=1')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain(
      'hop.top/some-new-repo git https://github.com/hop-top/some-new-repo',
    )
  })

  it('ignores homebrew homepage for go-get — modules live on the mirror', async () => {
    // Formula homepage points at the polyglot monolith; go-get must still
    // resolve to the hop-top/<pkg> mirror, whose tags Go can fetch.
    const res = await request('/c12n?go-get=1')
    const html = await res.text()
    expect(html).toContain('hop.top/c12n git https://github.com/hop-top/c12n')
  })

  it('still uses homebrew homepage for the human redirect', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('c12n') }).reply(
      200,
      'class C12n < Formula\n  homepage "https://github.com/hop-top/poly-c12n"\nend\n',
    )
    const res = await request('/c12n')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(
      'https://github.com/hop-top/poly-c12n',
    )
  })

  it('returns 404 for unknown x-number pattern (no homebrew fetch)', async () => {
    const res = await request('/x999?go-get=1')
    expect(res.status).toBe(404)
  })

  it('serves x402 as a real repo (carved out of reserved namespace)', async () => {
    const res = await request('/x402?go-get=1')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('hop.top/x402 git https://github.com/hop-top/x402')
  })

  it('redirects single-segment without ?go-get=1', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('some-repo') }).reply(404, '')
    const res = await request('/some-repo')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(
      'https://github.com/hop-top/some-repo',
    )
  })

  it('does not return vanity for multi-segment paths', async () => {
    // Hono's /:pkg matches a single path segment; /anything/sub falls through
    // to app.all('*') which proxies to SITE_URL. We don't assert on what the
    // site returns (mock or real) — only that no go-import meta is produced.
    const siteHost = new URL(env.SITE_URL).origin
    fetchMock.get(siteHost).intercept({ path: '/anything/sub', query: { 'go-get': '1' } }).reply(
      200,
      'site response',
    )
    const res = await request('/anything/sub?go-get=1')
    const html = await res.text()
    expect(html).not.toContain('go-import')
  })

  it('returns 404 for spec-* names (excluded from vanity)', async () => {
    const res = await request('/spec-crtx?go-get=1')
    expect(res.status).toBe(404)
  })

  it('returns 404 for the bare "spec" name', async () => {
    const res = await request('/spec?go-get=1')
    expect(res.status).toBe(404)
  })
})

// ── isSpecName helper ────────────────────────────────────────────

describe('isSpecName', () => {
  it('matches bare "spec"', () => {
    expect(isSpecName('spec')).toBe(true)
  })
  it('matches spec-* names', () => {
    expect(isSpecName('spec-crtx')).toBe(true)
    expect(isSpecName('spec-vein-wire')).toBe(true)
  })
  it('does not match unrelated names', () => {
    expect(isSpecName('crtx')).toBe(false)
    expect(isSpecName('specs')).toBe(false)
    expect(isSpecName('specialty')).toBe(false)
  })
})

// ── spec.hop.top spec serving ────────────────────────────────────

describe('spec.hop.top routing', () => {
  it('serves a schema from spec-<name>/main/specs/<version>/<file>', async () => {
    const body = '{"$id":"https://spec.hop.top/crtx/v0.1/envelope.schema.json"}'
    fetchMock
      .get(RAW)
      .intercept({ path: specPath('crtx', 'v0.1', 'envelope.schema.json') })
      .reply(200, body, { headers: { 'content-type': 'application/schema+json' } })
    const res = await request('/crtx/v0.1/envelope.schema.json', { host: 'spec.hop.top' })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/schema+json')
    expect(await res.text()).toBe(body)
  })

  it('serves nested file paths under a version', async () => {
    fetchMock
      .get(RAW)
      .intercept({ path: specPath('crtx', 'v0.1', 'examples/events/tool_called.json') })
      .reply(200, '{}', { headers: { 'content-type': 'application/json' } })
    const res = await request(
      '/crtx/v0.1/examples/events/tool_called.json',
      { host: 'spec.hop.top' },
    )
    expect(res.status).toBe(200)
  })

  it('returns 404 when upstream is missing', async () => {
    fetchMock
      .get(RAW)
      .intercept({ path: specPath('missing', 'v0.1', 'envelope.schema.json') })
      .reply(404, '')
    const res = await request('/missing/v0.1/envelope.schema.json', { host: 'spec.hop.top' })
    expect(res.status).toBe(404)
  })

  it('rejects names with unsafe characters', async () => {
    // Backslash is outside [A-Za-z0-9._-] so the name guard rejects it
    // before any upstream fetch. No fetchMock interceptor needed.
    const res = await request('/crtx%5C..%5Cevil/v0.1/envelope.schema.json', { host: 'spec.hop.top' })
    expect(res.status).toBe(404)
  })

  it('rejects file paths containing ..', async () => {
    const res = await request('/crtx/v0.1/../../etc/passwd', { host: 'spec.hop.top' })
    expect(res.status).toBe(404)
  })

  it('ignores the spec route on hop.top (non-spec subdomain)', async () => {
    // Two-segment path on hop.top falls through to site proxy, not to the
    // spec handler. We assert the spec handler did not fire by mocking only
    // the site proxy upstream; if the spec handler ran, the test would fail
    // with an unmocked-fetch error.
    const siteHost = new URL(env.SITE_URL).origin
    fetchMock
      .get(siteHost)
      .intercept({ path: '/crtx/v0.1/envelope.schema.json' })
      .reply(200, 'site fallthrough')
    const res = await request('/crtx/v0.1/envelope.schema.json')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('site fallthrough')
  })
})
