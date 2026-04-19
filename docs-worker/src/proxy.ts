import type { Context } from 'hono'
import { PROJECTS } from './projects'
import { navHeader } from './nav-header'
import { errorPage } from './error-page'

const PROJECT_SLUGS = PROJECTS.map((p) => p.slug)

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

  const headers = new Headers(c.req.raw.headers)
  headers.set('host', project.docsHost)
  headers.delete('cf-ray')
  headers.delete('cf-connecting-ip')
  headers.delete('cf-visitor')
  headers.delete('cf-ipcountry')

  try {
    const response = await fetch(url.toString(), {
      method: c.req.method,
      headers,
      body: c.req.raw.body,
      redirect: 'manual',
    })

    if (response.status === 522 || response.status === 523) {
      return c.html(errorPage(pkg), 502)
    }

    if (response.status === 404) {
      return c.html(errorPage(pkg), 404)
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
  const pkg = PROJECT_SLUGS.find((s) => referer.includes(`/${s}`))
  if (!pkg) return null

  const project = PROJECTS.find((p) => p.slug === pkg)
  if (!project) return null

  const url = new URL(c.req.url)
  url.hostname = project.docsHost

  const headers = new Headers(c.req.raw.headers)
  headers.set('host', project.docsHost)

  try {
    return await fetch(url.toString(), {
      method: c.req.method,
      headers,
      body: c.req.raw.body,
    })
  } catch {
    return null
  }
}
