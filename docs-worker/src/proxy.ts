import type { Context } from 'hono'
import { PROJECTS } from './projects'
import { navHeader } from './nav-header'
import { errorPage } from './error-page'

const PROJECT_SLUGS = PROJECTS.map((p) => p.slug)

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

/**
 * Proxy docs.hop.top/<pkg>/ to <pkg>.hop.top,
 * rewriting relative URLs and injecting unified nav.
 */
export async function proxyDocs(c: Context, pkg: string) {
  const project = PROJECTS.find((p) => p.slug === pkg)
  if (!project) {
    return c.html(errorPage(pkg), 404)
  }

  const url = new URL(c.req.url)
  url.hostname = project.docsHost
  // Strip leading /<pkg> prefix from path
  url.pathname = url.pathname.replace(new RegExp(`^/${pkg}`), '') || '/'

  const headers = safeHeaders(c.req.raw.headers)

  try {
    const response = await fetch(url.toString(), {
      method: c.req.method,
      headers,
      body: BODY_METHODS.has(c.req.method) ? c.req.raw.body : undefined,
      redirect: 'manual',
    })

    if (response.status === 522 || response.status === 523) {
      return c.html(errorPage(pkg), 502)
    }

    if (response.status === 404) {
      return c.html(errorPage(pkg), 404)
    }

    // Rewrite Location headers in 3xx responses
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (location) {
        const rewritten = rewriteLocation(location, project.docsHost, pkg)
        const resHeaders = new Headers(response.headers)
        resHeaders.set('location', rewritten)
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: resHeaders,
        })
      }
      return response
    }

    const contentType = response.headers.get('Content-Type') || ''
    if (!contentType.includes('text/html')) {
      return response
    }

    return new HTMLRewriter()
      .on('body', {
        element(el) {
          el.prepend(navHeader(project.name, pkg), { html: true })
        },
      })
      .on('link', {
        element(el) {
          rewriteAttr(el, 'href', pkg)
        },
      })
      .on('script', {
        element(el) {
          rewriteAttr(el, 'src', pkg)
        },
      })
      .on('img', {
        element(el) {
          rewriteAttr(el, 'src', pkg)
        },
      })
      .on('a', {
        element(el) {
          const href = el.getAttribute('href')
          if (
            href?.startsWith('/') &&
            !href.startsWith(`/${pkg}`) &&
            !PROJECT_SLUGS.some((s) => href.startsWith(`/${s}/`))
          ) {
            el.setAttribute('href', `/${pkg}${href}`)
          }
        },
      })
      .transform(response)
  } catch {
    return c.html(errorPage(pkg), 502)
  }
}

function rewriteAttr(el: Element, attr: string, pkg: string) {
  const val = el.getAttribute(attr)
  if (val?.startsWith('/') && !val.startsWith(`/${pkg}`)) {
    el.setAttribute(attr, `/${pkg}${val}`)
  }
}

/**
 * Proxy static assets whose referer indicates the originating project.
 */
export async function proxyAsset(c: Context) {
  const referer = c.req.header('referer') || ''
  const slug = PROJECT_SLUGS.find((s) => {
    const re = new RegExp(`/${s}(/|$)`)
    return re.test(referer)
  })
  if (!slug) return null

  const project = PROJECTS.find((p) => p.slug === slug)
  if (!project) return null

  const url = new URL(c.req.url)
  url.hostname = project.docsHost

  const headers = safeHeaders(c.req.raw.headers)

  try {
    return await fetch(url.toString(), {
      method: c.req.method,
      headers,
      body: BODY_METHODS.has(c.req.method) ? c.req.raw.body : undefined,
    })
  } catch {
    return null
  }
}

function rewriteLocation(
  location: string,
  upstreamHost: string,
  pkg: string,
): string {
  try {
    const loc = new URL(location)
    if (loc.hostname === upstreamHost) {
      return `/${pkg}${loc.pathname}${loc.search}${loc.hash}`
    }
  } catch {
    // relative URL or unparseable — leave as-is
  }
  return location
}
