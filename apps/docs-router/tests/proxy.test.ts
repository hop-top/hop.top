import { describe, it, expect } from 'vitest'
import { navHeader } from '../src/nav-header'
import { errorPage } from '../src/error-page'

describe('navHeader', () => {
  it('returns HTML string', () => {
    const html = navHeader('kit', 'kit')
    expect(html).toContain('<div')
    expect(html).toContain('</div>')
  })

  it('includes project name', () => {
    const html = navHeader('Kit Library', 'kit')
    expect(html).toContain('Kit Library')
  })

  it('includes link back to hub root', () => {
    const html = navHeader('kit', 'kit')
    expect(html).toContain('href="/"')
  })

  it('includes link to project docs root', () => {
    const html = navHeader('kit', 'kit')
    expect(html).toContain('href="/kit/"')
  })

  it('shows slug-based host label', () => {
    const html = navHeader('kit', 'kit')
    expect(html).toContain('kit.hop.top')
  })

  it('uses sticky positioning', () => {
    const html = navHeader('kit', 'kit')
    expect(html).toContain('position: sticky')
  })

  it('escapes different slugs correctly', () => {
    const html = navHeader('xrr-ts', 'xrr-ts')
    expect(html).toContain('href="/xrr-ts/"')
    expect(html).toContain('xrr-ts.hop.top')
  })
})

describe('errorPage', () => {
  it('returns valid HTML document', () => {
    const html = errorPage('nonexistent')
    expect(html).toMatch(/^<!DOCTYPE html>/)
    expect(html).toContain('<html')
    expect(html).toContain('<head>')
    expect(html).toContain('<body>')
    expect(html).toContain('</html>')
  })

  it('includes package name in title', () => {
    const html = errorPage('mypkg')
    expect(html).toContain('<title>mypkg - docs not available</title>')
  })

  it('includes package name in body', () => {
    const html = errorPage('mypkg')
    expect(html).toContain('<code>mypkg</code>')
  })

  it('includes link back to hub', () => {
    const html = errorPage('mypkg')
    expect(html).toContain('href="/"')
  })

  it('mentions docs not deployed', () => {
    const html = errorPage('mypkg')
    expect(html).toContain('docs not deployed')
  })

  it('references expected host', () => {
    const html = errorPage('mypkg')
    expect(html).toContain('mypkg.hop.top')
  })
})

describe('URL rewriting logic', () => {
  // Test the rewriteAttr pattern used in proxy.ts
  // (rewriteAttr is not exported, so we test the logic inline)

  function rewriteAttr(val: string | null, pkg: string): string | null {
    if (val?.startsWith('/') && !val.startsWith(`/${pkg}`)) {
      return `/${pkg}${val}`
    }
    return val
  }

  it('prefixes root-relative paths', () => {
    expect(rewriteAttr('/_astro/style.css', 'kit')).toBe(
      '/kit/_astro/style.css',
    )
  })

  it('does not double-prefix already-prefixed paths', () => {
    expect(rewriteAttr('/kit/_astro/style.css', 'kit')).toBe(
      '/kit/_astro/style.css',
    )
  })

  it('does not modify absolute URLs', () => {
    expect(
      rewriteAttr('https://cdn.example.com/style.css', 'kit'),
    ).toBe('https://cdn.example.com/style.css')
  })

  it('does not modify null', () => {
    expect(rewriteAttr(null, 'kit')).toBeNull()
  })

  it('does not modify relative paths (no leading slash)', () => {
    expect(rewriteAttr('style.css', 'kit')).toBe('style.css')
  })

  it('prefixes slash-only path', () => {
    expect(rewriteAttr('/', 'kit')).toBe('/kit/')
  })
})
