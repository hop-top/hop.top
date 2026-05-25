import {
  env,
  createExecutionContext,
  waitOnExecutionContext,
  fetchMock,
} from 'cloudflare:test'
import { beforeAll, afterEach, describe, it, expect } from 'vitest'
import app, { goVanity, resolveRepoUrl } from '../src/index'

const TAP = 'https://raw.githubusercontent.com'
const tapPath = (pkg: string) => `/hop-top/homebrew-tap/main/${pkg}.rb`

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
    fetchMock.get(TAP).intercept({ path: tapPath('some-new-repo') }).reply(404, '')
    const res = await request('/some-new-repo?go-get=1')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain(
      'hop.top/some-new-repo git https://github.com/hop-top/some-new-repo',
    )
  })

  it('uses homebrew homepage when available', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('usp') }).reply(
      200,
      'class Usp < Formula\n  homepage "https://github.com/hop-top/usp"\nend\n',
    )
    const res = await request('/usp?go-get=1')
    const html = await res.text()
    expect(html).toContain('hop.top/usp git https://github.com/hop-top/usp')
  })

  it('returns 404 for unknown x-number pattern (no homebrew fetch)', async () => {
    const res = await request('/x999?go-get=1')
    expect(res.status).toBe(404)
  })

  it('serves x402 as a real repo (carved out of reserved namespace)', async () => {
    fetchMock.get(TAP).intercept({ path: tapPath('x402') }).reply(404, '')
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
})
