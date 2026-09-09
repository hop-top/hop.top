import { describe, expect, it } from 'vitest'
import { PROJECTS } from '../src/projects'
import {
  renderLlmsTxt,
  renderRobotsTxt,
  renderSitemapXml,
} from '../src/discovery'

const site = new URL('https://docs.hop.top')

describe('documentation discovery artifacts', () => {
  it('advertises the host-owned sitemap in robots.txt', () => {
    expect(renderRobotsTxt(site)).toBe(
      [
        'User-agent: *',
        'Allow: /',
        'Sitemap: https://docs.hop.top/sitemap.xml',
        '',
      ].join('\n'),
    )
  })

  it('lists the hub and every documentation root in one-host sitemap XML', () => {
    const output = renderSitemapXml(site, [...PROJECTS].reverse())

    expect(output).toContain('<loc>https://docs.hop.top/</loc>')
    for (const project of PROJECTS) {
      expect(output).toContain(
        `<loc>https://docs.hop.top/${project.slug}/</loc>`,
      )
    }
    expect(output).not.toContain('<lastmod>')
    expect(output).not.toContain('kit.hop.top')
    expect(output).toBe(renderSitemapXml(site, PROJECTS))
  })

  it('renders a deterministic llms.txt with every documentation entry', () => {
    const output = renderLlmsTxt(site, [...PROJECTS].reverse())

    expect(output).toMatch(/^# hop\.top documentation\n\n> .+\n/)
    expect(output).toContain('\n## Project documentation\n')
    expect(output).toContain('\n## Optional\n')

    for (const project of PROJECTS) {
      expect(output).toContain(
        `- [${project.name}](https://docs.hop.top/${project.slug}/): ${project.description}`,
      )
    }

    const names = PROJECTS.map((project) => project.name).sort()
    const positions = names.map((name) =>
      output.indexOf(`- [${name}](https://docs.hop.top/`),
    )
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(output).not.toMatch(/generated (at|on)/i)
    expect(output).not.toMatch(/last (modified|updated)/i)
    expect(output).not.toMatch(/commit:? [0-9a-f]{7,40}/i)
    expect(output).toBe(renderLlmsTxt(site, PROJECTS))
  })
})
