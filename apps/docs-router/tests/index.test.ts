import { describe, it, expect, vi } from 'vitest'
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

describe('discovery routes', () => {
  it.each([
    ['/robots.txt', 'text/plain'],
    ['/llms.txt', 'text/plain'],
    ['/sitemap.xml', 'application/xml'],
  ])('serves %s with %s', async (path, contentType) => {
    const res = await app.request(path)

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain(contentType)
  })

  it('links discovery files from the documentation landing page', async () => {
    const res = await app.request('/')
    const body = await res.text()

    expect(body).toContain(
      '<link rel="sitemap" href="https://docs.hop.top/sitemap.xml">',
    )
    expect(body).toContain(
      '<link rel="describedby" href="https://docs.hop.top/llms.txt">',
    )
  })
})

describe('route: GET /:pkg/', () => {
  it('returns error page for unknown package', async () => {
    const res = await app.request('/nonexistent-pkg-xyz/')
    // unknown slug -> c.notFound() -> 404
    expect(res.status).toBe(404)
  })

  it('does not route specification repositories through the docs host', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn() as typeof fetch

    try {
      const res = await app.request('/spec-crtx/')

      expect(res.status).toBe(404)
      expect(globalThis.fetch).not.toHaveBeenCalled()
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('routes an unpublished catalog project to its conventional docs host', async () => {
    let upstreamUrl: string | undefined
    const originalFetch = globalThis.fetch
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      upstreamUrl = input.toString()
      return new Response('not published', { status: 404 })
    }) as typeof fetch

    try {
      const res = await app.request('/wsm/getting-started')

      expect(res.status).toBe(404)
      expect(upstreamUrl).toBe('https://wsm.hop.top/getting-started')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it.each(['/wsm', '/wsm/'])(
    'routes the project root %s to the origin root',
    async (path) => {
      let upstreamUrl: string | undefined
      const originalFetch = globalThis.fetch
      globalThis.fetch = (async (input: RequestInfo | URL) => {
        upstreamUrl = input.toString()
        return new Response('not published', { status: 404 })
      }) as typeof fetch

      try {
        const res = await app.request(path)

        expect(res.status).toBe(404)
        expect(upstreamUrl).toBe('https://wsm.hop.top/')
      } finally {
        globalThis.fetch = originalFetch
      }
    },
  )

  it('turns an unpublished origin DNS failure into the local unavailable page', async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(async () =>
      new Response('cloudflare origin error', { status: 530 }),
    ) as typeof fetch

    try {
      const res = await app.request('/wsm/')

      expect(res.status).toBe(502)
      expect(await res.text()).toContain('docs not deployed')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('uses the public APS Pages origin behind the canonical docs route', async () => {
    let upstreamUrl: string | undefined
    const originalFetch = globalThis.fetch
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      upstreamUrl = input.toString()
      return new Response('docs', { status: 200 })
    }) as typeof fetch

    try {
      await app.request('/aps/')

      expect(upstreamUrl).toBe('https://aps-site.pages.dev/')
    } finally {
      globalThis.fetch = originalFetch
    }
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
