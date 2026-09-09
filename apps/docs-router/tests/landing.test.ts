import { describe, it, expect } from 'vitest'
import { landingPage } from '../src/landing'
import { PROJECTS } from '../src/projects'

describe('landing page', () => {
  const html = landingPage()

  it('is structurally valid HTML', () => {
    expect(html).toMatch(/^<!DOCTYPE html>/)
    expect(html).toContain('<html')
    expect(html).toContain('<head>')
    expect(html).toContain('</head>')
    expect(html).toContain('<body>')
    expect(html).toContain('</body>')
    expect(html).toContain('</html>')
  })

  it('has proper meta tags', () => {
    expect(html).toContain('charset="utf-8"')
    expect(html).toContain('name="viewport"')
  })

  it('has a title', () => {
    expect(html).toMatch(/<title>.+<\/title>/)
  })

  it('contains all projects from registry', () => {
    for (const p of PROJECTS) {
      expect(html, `missing project: ${p.slug}`).toContain(p.name)
      expect(html, `missing description: ${p.slug}`).toContain(
        p.description,
      )
    }
  })

  it('project links point to correct docs URLs', () => {
    for (const p of PROJECTS) {
      expect(html).toContain(`href="/${p.slug}/"`)
    }
  })

  it('shows docsHost for each project', () => {
    for (const p of PROJECTS) {
      expect(html).toContain(p.docsHost)
    }
  })

  it('renders category sections', () => {
    expect(html).toContain('Core')
    expect(html).toContain('Tooling')
    expect(html).toContain('Runtime')
    expect(html).toContain('Language SDKs')
  })

  it('includes search/filter input', () => {
    expect(html).toContain('<input')
    expect(html).toContain('type="search"')
  })

  it('includes footer with links', () => {
    expect(html).toContain('<footer>')
    expect(html).toContain('https://hop.top')
    expect(html).toContain('https://github.com/hop-top')
  })
})
