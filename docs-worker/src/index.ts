import { Hono } from 'hono'
import { PROJECTS } from './projects'
import { landingPage } from './landing'
import { proxyDocs, proxyAsset } from './proxy'
import {
  renderLlmsTxt,
  renderRobotsTxt,
  renderSitemapXml,
} from './discovery'

const app = new Hono()

const PROJECT_SLUGS = PROJECTS.map((p) => p.slug)
const DOCS_SITE = new URL('https://docs.hop.top')
const ROBOTS_TXT = renderRobotsTxt(DOCS_SITE)
const LLMS_TXT = renderLlmsTxt(DOCS_SITE, PROJECTS)
const SITEMAP_XML = renderSitemapXml(DOCS_SITE, PROJECTS)

// Landing page at root
app.get('/', (c) => c.html(landingPage()))

app.get('/robots.txt', (c) => c.text(ROBOTS_TXT))
app.get('/llms.txt', (c) => c.text(LLMS_TXT))
app.get('/sitemap.xml', (c) =>
  c.body(SITEMAP_XML, 200, {
    'Content-Type': 'application/xml; charset=UTF-8',
  }),
)

// Static asset proxy (Starlight _astro, pagefind, fonts, etc.)
app.all(
  '/:path{((_astro|houston\\.webp|starlight|pagefind|fonts|images)/.*|favicon\\.svg)}',
  async (c) => {
    const resp = await proxyAsset(c)
    if (resp) return resp
    return c.notFound()
  },
)

// Package docs proxy
app.all('/:pkg/:path{.+}?', async (c) => {
  const pkg = c.req.param('pkg')

  if (!PROJECT_SLUGS.includes(pkg)) {
    return c.notFound()
  }

  return proxyDocs(c, pkg)
})

export default app
