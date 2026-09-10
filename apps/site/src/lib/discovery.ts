import type { Project } from '../data/projects';

type ProjectSummary = Pick<
  Project,
  'name' | 'description' | 'install' | 'docs' | 'spec'
>;

function absoluteUrl(site: URL, path: string): string {
  return new URL(path, `${site.origin}/`).toString();
}

export function renderRobotsTxt(site: URL): string {
  return [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${absoluteUrl(site, 'sitemap-index.xml')}`,
    '',
  ].join('\n');
}

export function renderLlmsTxt(
  site: URL,
  catalog: readonly ProjectSummary[],
): string {
  const projectLinks = [...catalog]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((project) => {
      const install = project.install
        ? ` Install: \`${project.install}\`.`
        : '';
      return `- [${project.name}](${absoluteUrl(site, project.name)}): ${project.description}${install}`;
    });
  const documentationLinks = [...catalog]
    .filter((project) => project.docs)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (project) =>
        `- [${project.name} documentation](${project.docs}): ${project.description}`,
    );
  const specificationLinks = [...catalog]
    .filter((project) => project.spec)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (project) =>
        `- [${project.name} specification](${project.spec}): ${project.description}`,
    );

  return [
    '# hop.top',
    '',
    '> Public gateway for the hop-top family of developer tools, libraries, runtimes, and specifications.',
    '',
    'Use package pages for concise project summaries and installation commands. Use the documentation hub for detailed project documentation. Go tooling can resolve a package through `hop.top/<package>?go-get=1`; canonical specifications use `spec.hop.top/<name>/<version>/<file>`.',
    '',
    '## Primary resources',
    '',
    `- [Ecosystem index](${absoluteUrl(site, '')}): Browse every project by category.`,
    '- [Documentation hub](https://docs.hop.top/): Browse unified project documentation.',
    '- [Documentation sitemap](https://docs.hop.top/sitemap.xml): Search-crawler index for documentation pages.',
    '',
    '## Projects',
    '',
    ...projectLinks,
    '',
    '## Documentation',
    '',
    ...documentationLinks,
    '',
    '## Specifications',
    '',
    ...specificationLinks,
    '',
    '## Optional',
    '',
    '- [Source organization](https://github.com/hop-top): Source repositories for the hop-top ecosystem.',
    `- [Gateway source](https://github.com/hop-top/hop.top): Source for ${site.hostname}, its routing Worker, and discovery files.`,
    '',
  ].join('\n');
}
