import { describe, it, expect } from 'vitest';
import { REPOS } from '../../worker/src/repos';
import { projects } from '../../site/src/data/projects';
import { PROJECTS } from '../../docs-worker/src/projects';

// Submodule entries (contain '/') are not expected in site/docs
const workerPackages = Object.keys(REPOS).filter(k => !k.includes('/'));

describe('data-sync: registries stay consistent', () => {
  it('every worker package exists in site projects', () => {
    const siteNames = new Set(projects.map(p => p.name));
    const missing = workerPackages.filter(pkg => !siteNames.has(pkg));
    expect(
      missing,
      `site/src/data/projects.ts missing: ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('every docs-worker project exists in worker repos', () => {
    const missing = PROJECTS.filter(p => !REPOS[p.slug]);
    expect(
      missing.map(p => p.slug),
      `worker/src/repos.ts missing docs-worker slugs`,
    ).toEqual([]);
  });

  it('GitHub URLs match between worker and site', () => {
    for (const proj of projects) {
      const workerUrl = REPOS[proj.name];
      if (!workerUrl) continue; // covered by first test
      expect(proj.repo, `${proj.name} repo URL mismatch`).toBe(workerUrl);
    }
  });

  it('GitHub URLs match between worker and docs-worker', () => {
    for (const proj of PROJECTS) {
      const workerUrl = REPOS[proj.slug];
      if (!workerUrl) continue; // covered by second test
      expect(proj.repo, `${proj.slug} repo URL mismatch`).toBe(workerUrl);
    }
  });

  it('no orphaned site projects (not in worker)', () => {
    const orphaned = projects.filter(p => !REPOS[p.name]);
    expect(
      orphaned.map(p => p.name),
      `site projects not in worker/src/repos.ts`,
    ).toEqual([]);
  });

  it('no orphaned docs-worker projects (not in worker)', () => {
    const orphaned = PROJECTS.filter(p => !REPOS[p.slug]);
    expect(
      orphaned.map(p => p.slug),
      `docs-worker projects not in worker/src/repos.ts`,
    ).toEqual([]);
  });

  it('submodule entries point to parent repo URL', () => {
    const submodules = Object.entries(REPOS).filter(
      ([k]) => k.includes('/'),
    );
    for (const [key, url] of submodules) {
      const parent = key.split('/')[0];
      const parentUrl = REPOS[parent];
      expect(url, `submodule ${key} URL`).toBe(parentUrl);
    }
  });
});
