import { describe, expect, it } from 'vitest';
import { projects } from '../src/data/projects';
import {
  renderLlmsTxt,
  renderRobotsTxt,
} from '../src/lib/discovery';

const site = new URL('https://hop.top');

describe('crawler discovery artifacts', () => {
  it('allows crawling and advertises the generated sitemap', () => {
    expect(renderRobotsTxt(site)).toBe(
      [
        'User-agent: *',
        'Allow: /',
        'Sitemap: https://hop.top/sitemap-index.xml',
        '',
      ].join('\n'),
    );
  });

  it('renders a valid llms.txt outline with every project', () => {
    const output = renderLlmsTxt(site, projects);

    expect(output).toMatch(/^# hop\.top\n\n> .+\n/);
    expect(output).toContain('\n## Projects\n');
    expect(output).toContain('\n## Documentation\n');
    expect(output).toContain('\n## Optional\n');

    for (const project of projects) {
      expect(output).toContain(
        `- [${project.name}](https://hop.top/${project.name}): ${project.description}`,
      );
    }

    for (const project of projects.filter((project) => project.docs)) {
      expect(output).toContain(
        `- [${project.name} documentation](${project.docs}): ${project.description}`,
      );
    }

    for (const project of projects.filter((project) => project.spec)) {
      expect(output).toContain(
        `- [${project.name} specification](${project.spec}): ${project.description}`,
      );
    }
  });

  it('orders project links deterministically', () => {
    const output = renderLlmsTxt(site, [...projects].reverse());
    const names = [...projects].map((project) => project.name).sort();
    const positions = names.map((name) =>
      output.indexOf(`- [${name}](https://hop.top/${name})`),
    );

    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('does not emit deployment timestamps or commit references', () => {
    const output = renderLlmsTxt(site, projects);

    expect(output).not.toMatch(/generated (at|on)/i);
    expect(output).not.toMatch(/last (modified|updated)/i);
    expect(output).not.toMatch(/commit:? [0-9a-f]{7,40}/i);
  });
});
