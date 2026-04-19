import { Hono } from 'hono'
import { PROJECTS } from './projects'
import { landingPage } from './landing'
import { proxyDocs, proxyAsset } from './proxy'

const app = new Hono()

const PROJECT_SLUGS = PROJECTS.map((p) => p.slug)

// Landing page at root
app.get('/', (c) => c.html(landingPage()))

// Static asset proxy (Starlight _astro, pagefind, fonts, etc.)
app.all(
  '/:path{(_astro|favicon\\.svg|houston\\.webp|starlight|pagefind|fonts|images)/.*}',
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
