import { Hono } from 'hono'

type Bindings = {
  SITE_URL: string
  X402_CLIENT_ID: string
  X402_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

const SAFE_HEADERS = new Set([
  'accept', 'accept-language', 'accept-encoding', 'user-agent',
  'cache-control', 'if-none-match', 'if-modified-since',
])

function safeHeaders(raw: Headers): Headers {
  const out = new Headers()
  for (const [k, v] of raw.entries()) {
    if (SAFE_HEADERS.has(k.toLowerCase())) out.set(k, v)
  }
  return out
}

export const goVanity = (importPath: string, repoUrl: string) => `<!DOCTYPE html>
<html>
<head>
<meta name="go-import" content="${importPath} git ${repoUrl}">
<meta name="go-source" content="${importPath} ${repoUrl} ${repoUrl}/tree/main{/dir} ${repoUrl}/blob/main{/dir}/{file}#L{line}">
<meta http-equiv="refresh" content="3; url=${repoUrl}">
</head>
<body>
Redirecting to <a href="${repoUrl}">${repoUrl}</a>...
</body>
</html>`

// Resolve a vanity pkg name to a GitHub URL.
// 1. Try the Homebrew formula in hop-top/homebrew-tap (cached at Cloudflare edge).
// 2. Fall back to the convention: github.com/hop-top/<pkg>.
export async function resolveRepoUrl(pkg: string): Promise<string> {
  const fallback = `https://github.com/hop-top/${pkg}`
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/hop-top/homebrew-tap/main/${pkg}.rb`,
      { cf: { cacheTtl: 3600, cacheEverything: true } } as RequestInit,
    )
    if (!res.ok) return fallback
    const formula = await res.text()
    const m = formula.match(/^\s*homepage\s+"([^"]+)"/m)
    return m?.[1] ?? fallback
  } catch {
    return fallback
  }
}

// Specs are not Go packages. Exclude them from vanity-import resolution so
// `go get hop.top/spec-crtx` does NOT return a redirect; specs are served
// only via spec.hop.top/<name>/<version>/<file>.
export function isSpecName(pkg: string): boolean {
  return pkg === 'spec' || pkg.startsWith('spec-')
}

function refererSubdomain(referer: string): string | null {
  try {
    const url = new URL(referer)
    if (!url.hostname.endsWith('.hop.top')) return null
    const sub = url.hostname.slice(0, -'.hop.top'.length)
    return sub && !sub.includes('.') ? sub : null
  } catch {
    return null
  }
}

// Static assets requested without subdomain prefix — proxy to the referer's subdomain.
app.all(
  '/:path{((_astro|houston\\.webp|starlight|pagefind|fonts|images)/.*|favicon\\.svg)}',
  async (c) => {
    const sub = refererSubdomain(c.req.header('referer') || '')

    if (sub) {
      const url = new URL(c.req.url)
      url.hostname = `${sub}.hop.top`
      const headers = safeHeaders(c.req.raw.headers)
      headers.set('CF-Access-Client-Id', c.env.X402_CLIENT_ID || '')
      headers.set('CF-Access-Client-Secret', c.env.X402_CLIENT_SECRET || '')
      try {
        return await fetch(url.toString(), { method: c.req.method, headers })
      } catch {}
    }

    const url = new URL(c.req.url)
    const siteUrl = new URL(c.env.SITE_URL)
    url.hostname = siteUrl.hostname
    url.protocol = siteUrl.protocol
    return fetch(new Request(url.toString(), c.req.raw))
  },
)

// spec.hop.top/<name>/<version>/<file> — serve canonical schema/spec
// documents from github.com/hop-top/spec-<name>/raw/main/specs/<version>/<file>.
// Specs use a dedicated subdomain so they stay disjoint from the
// Go-vanity package namespace at hop.top/<pkg>.
//
// Guarded by hostname so the same /:name/:version/:file shape on hop.top
// (or any other subdomain) falls through to the site proxy unchanged.
app.use('/:name/:version/:file{.+}', async (c, next) => {
  const url = new URL(c.req.url)
  if (url.hostname !== 'spec.hop.top') return next()

  const name = c.req.param('name')
  const version = c.req.param('version')
  const file = c.req.param('file')

  // Basic guards: only allow well-formed segments to prevent traversal /
  // arbitrary refspecs from leaking through into the raw.githubusercontent
  // fetch.
  const safe = /^[A-Za-z0-9._-]+$/
  if (
    !safe.test(name) ||
    name.startsWith('.') ||
    !safe.test(version) ||
    version.startsWith('.') ||
    !/^[A-Za-z0-9._/-]+$/.test(file) ||
    file.includes('..') ||
    file.startsWith('/') ||
    file.startsWith('.')
  ) {
    return c.notFound()
  }

  const upstream = `https://raw.githubusercontent.com/hop-top/spec-${name}/main/specs/${version}/${file}`
  const res = await fetch(upstream, { cf: { cacheTtl: 300, cacheEverything: true } } as RequestInit)
  if (!res.ok) return c.notFound()
  const body = await res.arrayBuffer()
  const headers = new Headers()
  const upstreamType = res.headers.get('content-type')
  if (upstreamType) headers.set('content-type', upstreamType)
  headers.set('cache-control', 'public, max-age=300')
  return new Response(body, { status: 200, headers })
})

// Single-segment paths: go-vanity OR redirect to the resolved GitHub URL.
app.all('/:pkg', async (c) => {
  const pkg = c.req.param('pkg')
  const goGet = c.req.query('go-get') === '1'

  // Reserve x[number] as a free namespace for future x402-style protocols.
  if (/^x\d+$/.test(pkg) && pkg !== 'x402') return c.notFound()

  // Specs are not Go packages — exclude from vanity-import resolution.
  if (isSpecName(pkg)) return c.notFound()

  const repoUrl = await resolveRepoUrl(pkg)
  if (goGet) return c.html(goVanity(`hop.top/${pkg}`, repoUrl))
  return c.redirect(repoUrl)
})

// Fallthrough: proxy everything else to the main site.
app.all('*', async (c) => {
  const url = new URL(c.req.url)
  const siteUrl = new URL(c.env.SITE_URL)
  url.hostname = siteUrl.hostname
  url.protocol = siteUrl.protocol
  url.port = siteUrl.port
  return fetch(new Request(url.toString(), c.req.raw))
})

export default app
