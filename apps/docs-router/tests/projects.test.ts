import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { PROJECTS, ROUTABLE_SLUGS, type Project } from '../src/projects'

const wranglerConfig = readFileSync(
  new URL('../wrangler.toml', import.meta.url),
  'utf8',
)

describe('projects registry', () => {
  it('has at least one project', () => {
    expect(PROJECTS.length).toBeGreaterThan(0)
  })

  it('contains only the verified APS documentation site', () => {
    expect(PROJECTS).toEqual([
      {
        name: 'aps',
        slug: 'aps',
        description: 'Agent Profile System',
        repo: 'https://github.com/hop-top/aps',
        originHost: 'aps-site.pages.dev',
        category: 'tooling',
      },
    ])
  })

  it('routes every docs-eligible marketing project when its docs are published', () => {
    expect(ROUTABLE_SLUGS).toEqual([
      'agr', 'aps', 'axon', 'ben', 'c12n', 'cite', 'cxr', 'eva', 'fit',
      'git', 'ibr', 'nerv', 'pod', 'stem', 'tip', 'tlc', 'vein', 'wsm',
      'xat', 'xrr',
    ])
  })

  it('keeps specification repositories out of documentation routing', () => {
    expect(ROUTABLE_SLUGS).not.toContain('spec-crtx')
  })

  it('all entries have required fields', () => {
    for (const p of PROJECTS) {
      expect(p.name, `${p.slug} missing name`).toBeTruthy()
      expect(p.slug, `${p.name} missing slug`).toBeTruthy()
      expect(p.description, `${p.slug} missing description`).toBeTruthy()
      expect(p.repo, `${p.slug} missing repo`).toBeTruthy()
      expect(p.originHost, `${p.slug} missing originHost`).toBeTruthy()
      expect(p.category, `${p.slug} missing category`).toBeTruthy()
    }
  })

  it('no duplicate slugs', () => {
    const slugs = PROJECTS.map((p) => p.slug)
    const unique = new Set(slugs)
    expect(slugs.length).toBe(unique.size)
  })

  it('no slug shadows a discovery route', () => {
    const reserved = ['robots.txt', 'sitemap.xml', 'llms.txt']

    for (const project of PROJECTS) {
      expect(reserved).not.toContain(project.slug)
    }
  })

  it('originHost format is a valid hostname', () => {
    for (const p of PROJECTS) {
      expect(p.originHost).toMatch(/^[a-z0-9.-]+$/)
    }
  })

  it('repo URLs are valid GitHub URLs', () => {
    for (const p of PROJECTS) {
      expect(p.repo).toMatch(/^https:\/\/github\.com\/hop-top\//)
    }
  })

  it('category is one of allowed values', () => {
    const allowed: Project['category'][] = [
      'core',
      'tooling',
      'runtime',
      'language-sdk',
    ]
    for (const p of PROJECTS) {
      expect(allowed).toContain(p.category)
    }
  })
})

describe('Wrangler routing', () => {
  it('owns docs.hop.top as a custom domain', () => {
    expect(wranglerConfig).toContain(
      '{ pattern = "docs.hop.top", custom_domain = true }',
    )
    expect(wranglerConfig).not.toContain('docs.hop.top/*')
  })
})
