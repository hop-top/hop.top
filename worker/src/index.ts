import { Hono } from 'hono'
import type { Context } from 'hono'
import { REPOS } from './repos'

type Bindings = {
  SITE_URL: string
  X402_CLIENT_ID: string
  X402_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

const SAFE_HEADERS = new Set([
  'accept',
  'accept-language',
  'accept-encoding',
  'user-agent',
  'cache-control',
  'if-none-match',
  'if-modified-since',
])

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH'])

function safeHeaders(raw: Headers): Headers {
  const out = new Headers()
  for (const [k, v] of raw.entries()) {
    if (SAFE_HEADERS.has(k.toLowerCase())) {
      out.set(k, v)
    }
  }
  return out
}

// Subdomains that should be proxied with Access headers and HTML rewriting
// We include all repo names except the main 'hop' toolkit repo
const PROXIED_SUBDOMAINS = Object.keys(REPOS).filter(
  name => name !== 'hop' && !name.includes('/')
)

// Helper for Go vanity response
export const goVanity = (importPath: string, repoUrl: string) => {
  return `<!DOCTYPE html>
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
}

// Helper to proxy to a subdomain with headers and rewriting
async function proxyToSubdomain(
  c: Context<{ Bindings: Bindings }>,
  subdomain: string,
) {
  const url = new URL(c.req.url)
  const targetHost = `${subdomain}.hop.top`
  url.hostname = targetHost
  url.pathname = url.pathname.replace(new RegExp(`^\\/${subdomain}`), '') || '/'

  const headers = safeHeaders(c.req.raw.headers)
  headers.set('CF-Access-Client-Id', c.env.X402_CLIENT_ID || '')
  headers.set('CF-Access-Client-Secret', c.env.X402_CLIENT_SECRET || '')

  try {
    const response = await fetch(url.toString(), {
      method: c.req.method,
      headers,
      body: BODY_METHODS.has(c.req.method) ? c.req.raw.body : undefined,
      redirect: 'manual'
    })

    // Cloudflare connection errors => fallback to GitHub
    if (response.status === 522 || response.status === 523) {
      throw new Error('Subdomain not reachable')
    }

    // Only rewrite HTML content
    const contentType = response.headers.get('Content-Type') || ''
    if (contentType.includes('text/html')) {
      return new HTMLRewriter()
        .on('link', {
          element(el) {
            const href = el.getAttribute('href')
            if (
              href?.startsWith('/') &&
              !href.startsWith(`/${subdomain}`) &&
              !PROXIED_SUBDOMAINS.some(s => href.startsWith(`/${s}/`))
            ) {
              el.setAttribute('href', `/${subdomain}${href}`)
            }
          }
        })
        .on('script', {
          element(el) {
            const src = el.getAttribute('src')
            if (
              src?.startsWith('/') &&
              !src.startsWith(`/${subdomain}`) &&
              !PROXIED_SUBDOMAINS.some(s => src.startsWith(`/${s}/`))
            ) {
              el.setAttribute('src', `/${subdomain}${src}`)
            }
          }
        })
        .on('img', {
          element(el) {
            const src = el.getAttribute('src')
            if (
              src?.startsWith('/') &&
              !src.startsWith(`/${subdomain}`) &&
              !PROXIED_SUBDOMAINS.some(s => src.startsWith(`/${s}/`))
            ) {
              el.setAttribute('src', `/${subdomain}${src}`)
            }
          }
        })
        .on('a', {
          element(el) {
            const href = el.getAttribute('href')
            if (
              href?.startsWith('/') &&
              !href.startsWith(`/${subdomain}`) &&
              !PROXIED_SUBDOMAINS.some(s => href.startsWith(`/${s}/`))
            ) {
              el.setAttribute('href', `/${subdomain}${href}`)
            }
          }
        })
        .transform(response)
    }

    return response
  } catch (e) {
    return c.redirect(REPOS[subdomain])
  }
}

// Proxy static assets that might be requested without the subdomain prefix
app.all(
  '/:path{((_astro|houston\\.webp|starlight|pagefind|fonts|images)/.*|favicon\\.svg)}',
  async (c) => {
    const referer = c.req.header('referer') || ''
    // Sort by length descending to avoid prefix collisions (e.g. xrr vs xrr-rs)
    const sorted = [...PROXIED_SUBDOMAINS].sort((a, b) => b.length - a.length)
    const subdomain = sorted.find(s => {
      try {
        const refUrl = new URL(referer)
        const firstSeg = refUrl.pathname.split('/')[1]
        return firstSeg === s
      } catch { return false }
    })

    if (subdomain) {
      const url = new URL(c.req.url)
      const targetHost = `${subdomain}.hop.top`
      url.hostname = targetHost

      const headers = safeHeaders(c.req.raw.headers)
      headers.set('CF-Access-Client-Id', c.env.X402_CLIENT_ID || '')
      headers.set('CF-Access-Client-Secret', c.env.X402_CLIENT_SECRET || '')

      try {
        return await fetch(url.toString(), {
          method: c.req.method,
          headers,
          body: BODY_METHODS.has(c.req.method) ? c.req.raw.body : undefined,
        })
      } catch (e) {
        // Asset failed to proxy, continue to main site fallback
      }
    }

    // Fallthrough to main site proxy
    const url = new URL(c.req.url)
    const siteUrl = new URL(c.env.SITE_URL)
    url.hostname = siteUrl.hostname
    url.protocol = siteUrl.protocol
    return fetch(new Request(url.toString(), c.req.raw))
  }
)

// Go vanity and domain routes
app.all('/:pkg/:path{.+}?', async (c, next) => {
  const pkg = c.req.param('pkg')
  const subpath = c.req.param('path') || ''
  const goGet = c.req.query('go-get') === '1'

  // Check submodule key first (e.g. "uri/completions")
  if (goGet && subpath) {
    const subKey = `${pkg}/${subpath.split('/')[0]}`
    const subUrl = REPOS[subKey]
    if (subUrl) {
      return c.html(goVanity(`hop.top/${subKey}`, subUrl))
    }
  }

  // Handle other x[number] patterns (except ones explicitly in REPOS)
  if (/^x\d+$/.test(pkg) && !REPOS[pkg]) {
    return c.notFound()
  }

  // If it's a known repo and NOT a go-get request, try proxying it
  if (PROXIED_SUBDOMAINS.includes(pkg) && !goGet) {
    return proxyToSubdomain(c, pkg)
  }

  // Go vanity logic from dynamic REPOS map
  const repoUrl = REPOS[pkg]
  if (!repoUrl) {
    return next()
  }

  if (goGet) {
    return c.html(goVanity(`hop.top/${pkg}`, repoUrl))
  }

  return c.redirect(repoUrl)
})

// Main site proxy
app.all('*', async (c) => {
  const url = new URL(c.req.url)
  const siteUrl = new URL(c.env.SITE_URL)
  url.hostname = siteUrl.hostname
  url.protocol = siteUrl.protocol
  url.port = siteUrl.port

  const request = new Request(url.toString(), c.req.raw)
  return fetch(request)
})

export default app
