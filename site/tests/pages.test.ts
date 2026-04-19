import { describe, it, expect } from 'vitest';
import { projects } from '../src/data/projects';

const RESERVED_PATHS = ['index', '404', 'favicon.ico', 'favicon.svg'];

describe('static page generation', () => {
  it('generates a path for each project', () => {
    // Mirrors getStaticPaths() in [pkg].astro
    const paths = projects.map((p) => ({
      params: { pkg: p.name },
      props: { project: p },
    }));

    expect(paths.length).toBe(projects.length);
    for (const entry of paths) {
      expect(entry.params.pkg).toBeTruthy();
      expect(entry.props.project).toBeDefined();
    }
  });

  it('no project slug conflicts with reserved paths', () => {
    const slugs = projects.map((p) => p.name);
    for (const slug of slugs) {
      expect(
        RESERVED_PATHS,
        `project slug "${slug}" conflicts with reserved path`,
      ).not.toContain(slug);
    }
  });

  it('all slugs are URL-safe', () => {
    const urlSafe = /^[a-z0-9][a-z0-9-]*$/;
    for (const p of projects) {
      expect(
        p.name,
        `"${p.name}" is not URL-safe`,
      ).toMatch(urlSafe);
    }
  });
});
