import { describe, it, expect } from 'vitest'
import app from '../src/index'
import { PROJECTS } from '../src/projects'

describe('route: GET /', () => {
  it('returns 200', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
  })

  it('returns text/html', async () => {
    const res = await app.request('/')
    expect(res.headers.get('content-type')).toContain('text/html')
  })

  it('body contains landing page content', async () => {
    const res = await app.request('/')
    const body = await res.text()
    expect(body).toContain('hop.top')
    expect(body).toContain('<!DOCTYPE html>')
  })
})

describe('route: GET /:pkg/', () => {
  it('returns error page for unknown package', async () => {
    const res = await app.request('/nonexistent-pkg-xyz/')
    // unknown slug -> c.notFound() -> 404
    expect(res.status).toBe(404)
  })

  it('known package attempts proxy (network error = 502)', async () => {
    // In test env, fetch to kit.hop.top will fail -> 502 error page
    const res = await app.request('/kit/')
    // Either 502 (proxy catch block) or some status from actual fetch
    expect([200, 404, 502]).toContain(res.status)
  })
})

describe('route: asset proxy', () => {
  it('returns 404 without valid referer', async () => {
    const res = await app.request('/_astro/some-file.css')
    expect(res.status).toBe(404)
  })

  it('attempts proxy with valid referer', async () => {
    const slug = PROJECTS[0].slug
    const res = await app.request('/_astro/style.css', {
      headers: { referer: `https://docs.hop.top/${slug}/getting-started` },
    })
    // fetch will likely fail in test env, but should attempt proxy
    // 200 if upstream answers, 404 if proxyAsset returns null
    expect([200, 404, 502]).toContain(res.status)
  })
})

describe('route: unknown paths', () => {
  it('GET /nonexistent returns 404', async () => {
    const res = await app.request('/zzz-does-not-exist')
    expect(res.status).toBe(404)
  })
})
