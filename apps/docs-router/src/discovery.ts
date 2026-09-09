import type { Project } from './projects'

type ProjectSummary = Pick<Project, 'name' | 'slug' | 'description' | 'repo'>

function absoluteUrl(site: URL, path: string): string {
  return new URL(path, `${site.origin}/`).toString()
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function renderRobotsTxt(site: URL): string {
  return [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${absoluteUrl(site, 'sitemap.xml')}`,
    '',
  ].join('\n')
}

export function renderSitemapXml(
  site: URL,
  catalog: readonly ProjectSummary[],
): string {
  const urls = [
    absoluteUrl(site, ''),
    ...[...catalog]
      .sort((a, b) => a.slug.localeCompare(b.slug))
      .map((project) => absoluteUrl(site, `${project.slug}/`)),
  ]

  const entries = urls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    '',
  ].join('\n')
}

export function renderLlmsTxt(
  site: URL,
  catalog: readonly ProjectSummary[],
): string {
  const projectLinks = [...catalog]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (project) =>
        `- [${project.name}](${absoluteUrl(site, `${project.slug}/`)}): ${project.description} Source: ${project.repo}.`,
    )

  return [
    '# hop.top documentation',
    '',
    '> Unified documentation gateway for the hop-top ecosystem.',
    '',
    'Use the project documentation links below for detailed guides and references. The ecosystem index provides package summaries and installation commands.',
    '',
    '## Project documentation',
    '',
    ...projectLinks,
    '',
    '## Optional',
    '',
    '- [Ecosystem index](https://hop.top/): Browse every hop-top project by category.',
    `- [Documentation sitemap](${absoluteUrl(site, 'sitemap.xml')}): Search-crawler index for this documentation host.`,
    '- [Source organization](https://github.com/hop-top): Source repositories for the hop-top ecosystem.',
    '',
  ].join('\n')
}
