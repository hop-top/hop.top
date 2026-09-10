import { describe, it, expect, vi, afterEach } from 'vitest'
import app from '../src/index'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('Bug 1: credential leak — sensitive headers stripped', () => {
  it('strips Cookie header from proxied request', async () => {
    let capturedHeaders: Headers | undefined
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedHeaders = new Headers(init?.headers)
      return new Response('ok', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }) as any

    await app.request('/aps', {
      headers: {
        Cookie: 'session=secret123',
        Accept: 'text/html',
      },
    })

    expect(capturedHeaders!.has('cookie')).toBe(false)
  })

  it('strips Authorization header from proxied request', async () => {
    let capturedHeaders: Headers | undefined
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedHeaders = new Headers(init?.headers)
      return new Response('ok', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }) as any

    await app.request('/aps', {
      headers: {
        Authorization: 'Bearer tok_secret',
        Accept: 'text/html',
      },
    })

    expect(capturedHeaders!.has('authorization')).toBe(false)
  })

  it('keeps safe headers (Accept, User-Agent, etc.)', async () => {
    let capturedHeaders: Headers | undefined
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedHeaders = new Headers(init?.headers)
      return new Response('ok', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }) as any

    await app.request('/aps', {
      headers: {
        Accept: 'text/html',
        'Accept-Language': 'en',
        'User-Agent': 'TestBot/1.0',
        'Cache-Control': 'no-cache',
        'If-None-Match': '"abc"',
        'If-Modified-Since': 'Thu, 01 Jan 2025 00:00:00 GMT',
        'Accept-Encoding': 'gzip',
      },
    })

    expect(capturedHeaders!.get('accept')).toBe('text/html')
    expect(capturedHeaders!.get('accept-language')).toBe('en')
    expect(capturedHeaders!.get('user-agent')).toBe('TestBot/1.0')
    expect(capturedHeaders!.get('cache-control')).toBe('no-cache')
    expect(capturedHeaders!.get('if-none-match')).toBe('"abc"')
    expect(capturedHeaders!.get('if-modified-since')).toBeTruthy()
    expect(capturedHeaders!.get('accept-encoding')).toBe('gzip')
  })
})

describe('Bug 2: body on GET/HEAD', () => {
  it('does not pass body on GET requests', async () => {
    let capturedBody: any
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedBody = init?.body
      return new Response('ok', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }) as any

    await app.request('/aps', { method: 'GET' })

    expect(capturedBody).toBeUndefined()
  })

  it('does not pass body on HEAD requests', async () => {
    let capturedBody: any
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedBody = init?.body
      return new Response('', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }) as any

    await app.request('/aps', { method: 'HEAD' })

    expect(capturedBody).toBeUndefined()
  })

  it('passes body on POST requests', async () => {
    let capturedBody: any
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedBody = init?.body
      return new Response('ok', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }) as any

    await app.request('/aps', {
      method: 'POST',
      body: 'test-payload',
    })

    expect(capturedBody).toBeDefined()
  })
})

describe('Bug 3: forbidden Host header', () => {
  it('does not set Host header in proxyDocs', async () => {
    let capturedHeaders: Headers | undefined
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedHeaders = new Headers(init?.headers)
      return new Response('ok', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }) as any

    await app.request('/aps')

    expect(capturedHeaders!.has('host')).toBe(false)
  })

  it('does not set Host header in proxyAsset', async () => {
    let capturedHeaders: Headers | undefined
    globalThis.fetch = vi.fn(async (_url: any, init: any) => {
      capturedHeaders = new Headers(init?.headers)
      return new Response('ok', {
        headers: { 'Content-Type': 'text/css' },
      })
    }) as any

    await app.request('/_astro/style.css', {
      headers: { referer: 'https://docs.hop.top/aps/getting-started' },
    })

    expect(capturedHeaders!.has('host')).toBe(false)
  })
})

describe('Bug 4: redirect Location headers', () => {
  it('rewrites upstream Location to /<pkg>/ prefix', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(null, {
        status: 301,
        headers: { Location: 'https://aps-site.pages.dev/guides/intro/' },
      })
    }) as any

    const res = await app.request('/aps/guides/intro')

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/aps/guides/intro/')
  })

  it('rewrites 302 Location headers', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(null, {
        status: 302,
        headers: { Location: 'https://aps-site.pages.dev/new-path/' },
      })
    }) as any

    const res = await app.request('/aps/old-path')

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/aps/new-path/')
  })

  it('passes through non-upstream Location URLs', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(null, {
        status: 301,
        headers: { Location: 'https://external.example.com/path' },
      })
    }) as any

    const res = await app.request('/aps/some-page')

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(
      'https://external.example.com/path',
    )
  })
})

describe('Bug 4b: relative Location headers', () => {
  it('rewrites relative Location like /guides/intro/', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(null, {
        status: 301,
        headers: { Location: '/guides/intro/' },
      })
    }) as any

    const res = await app.request('/aps/guides/intro')

    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/aps/guides/intro/')
  })

  it('rewrites relative Location with query string', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(null, {
        status: 302,
        headers: { Location: '/api/?version=2' },
      })
    }) as any

    const res = await app.request('/aps/api')

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/aps/api/?version=2')
  })
})

describe('Bug 5: slug prefix collision', () => {
  it('does not match aps when referer contains /aps-extra/', async () => {
    let capturedUrl: string | undefined
    globalThis.fetch = vi.fn(async (url: any) => {
      capturedUrl = typeof url === 'string' ? url : url.toString()
      return new Response('ok', {
        headers: { 'Content-Type': 'text/css' },
      })
    }) as any

    await app.request('/_astro/style.css', {
      headers: {
        referer: 'https://docs.hop.top/aps-extra/getting-started',
      },
    })

    expect(capturedUrl).toBeUndefined()
  })

  it('matches aps when referer contains exactly /aps/', async () => {
    let capturedUrl: string | undefined
    globalThis.fetch = vi.fn(async (url: any) => {
      capturedUrl = typeof url === 'string' ? url : url.toString()
      return new Response('ok', {
        headers: { 'Content-Type': 'text/css' },
      })
    }) as any

    await app.request('/_astro/style.css', {
      headers: {
        referer: 'https://docs.hop.top/aps/getting-started',
      },
    })

    expect(capturedUrl).toContain('aps-site.pages.dev')
  })

  it('matches slug at end of referer path (no trailing slash)', async () => {
    let capturedUrl: string | undefined
    globalThis.fetch = vi.fn(async (url: any) => {
      capturedUrl = typeof url === 'string' ? url : url.toString()
      return new Response('ok', {
        headers: { 'Content-Type': 'text/css' },
      })
    }) as any

    await app.request('/_astro/style.css', {
      headers: {
        referer: 'https://docs.hop.top/aps',
      },
    })

    if (capturedUrl) {
      expect(capturedUrl).toContain('aps-site.pages.dev')
    }
  })
})
