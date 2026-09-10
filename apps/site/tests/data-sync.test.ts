import { describe, expect, it } from 'vitest';
import { categories, projects } from '../src/data/projects';

describe('project catalog integrity', () => {
  it('uses unique project names and repositories', () => {
    const names = projects.map((project) => project.name);
    const repositories = projects.map((project) => project.repo);

    expect(new Set(names).size).toBe(names.length);
    expect(new Set(repositories).size).toBe(repositories.length);
  });

  it('contains complete, well-formed public project metadata', () => {
    for (const project of projects) {
      expect(project.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(project.repo).toMatch(/^https:\/\/github\.com\/hop-top\/[a-z0-9-]+$/);
      expect(project.description.trim().length).toBeGreaterThan(0);
      expect(categories[project.category]).toBeDefined();
    }
  });

  it('does not publish unsupported install commands', () => {
    expect(projects.every((project) => project.install === undefined)).toBe(true);
  });

  it('links only verified published documentation', () => {
    expect(
      projects
        .filter((project) => project.docs)
        .map((project) => project.name),
    ).toEqual(['aps']);
  });

  it('keeps specifications versioned and separate from documentation', () => {
    const specifications = projects.filter((project) => project.spec);

    expect(specifications.length).toBeGreaterThan(0);
    for (const project of specifications) {
      expect(project.spec).toMatch(
        /^https:\/\/spec\.hop\.top\/[a-z0-9-]+\/v[0-9]+(?:\.[0-9]+)*\/.+/,
      );
      expect(project.docs).toBeUndefined();
    }
  });
});
