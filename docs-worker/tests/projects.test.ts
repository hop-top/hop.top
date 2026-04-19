import { describe, it, expect } from 'vitest'
import { PROJECTS, type Project } from '../src/projects'

describe('projects registry', () => {
  it('has at least one project', () => {
    expect(PROJECTS.length).toBeGreaterThan(0)
  })

  it('all entries have required fields', () => {
    for (const p of PROJECTS) {
      expect(p.name, `${p.slug} missing name`).toBeTruthy()
      expect(p.slug, `${p.name} missing slug`).toBeTruthy()
      expect(p.description, `${p.slug} missing description`).toBeTruthy()
      expect(p.repo, `${p.slug} missing repo`).toBeTruthy()
      expect(p.docsHost, `${p.slug} missing docsHost`).toBeTruthy()
      expect(p.category, `${p.slug} missing category`).toBeTruthy()
    }
  })

  it('no duplicate slugs', () => {
    const slugs = PROJECTS.map((p) => p.slug)
    const unique = new Set(slugs)
    expect(slugs.length).toBe(unique.size)
  })

  it('docsHost format is valid (subdomain of hop.top)', () => {
    for (const p of PROJECTS) {
      expect(p.docsHost).toMatch(/^[a-z0-9-]+\.hop\.top$/)
    }
  })

  it('docsHost matches slug convention', () => {
    for (const p of PROJECTS) {
      expect(p.docsHost).toBe(`${p.slug}.hop.top`)
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
