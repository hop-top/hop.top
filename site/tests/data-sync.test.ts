import { describe, it, expect } from 'vitest';
import { projects } from '../src/data/projects';

const documentedProjects = [
  'aps', 'cite', 'eva', 'gym', 'ibr', 'kit',
  'rsx', 'tlc', 'wsm', 'xrr',
  'xrr-php', 'xrr-py', 'xrr-rs', 'xrr-ts',
];

describe('data sync baseline', () => {
  // Documents the current project set so drift between registries
  // (site/src/data/projects.ts vs docs-worker/src/projects.ts)
  // is caught by a snapshot diff.

  it('project names snapshot', () => {
    const names = projects.map((p) => p.name).sort();
    expect(names).toMatchInlineSnapshot(`
      [
        "aom",
        "aps",
        "ben",
        "cite",
        "cxr",
        "eva",
        "eva-ee",
        "eva-pkg",
        "git",
        "gym",
        "hdox",
        "hop",
        "ibr",
        "kit",
        "mde",
        "mdl",
        "orb",
        "par",
        "rlz",
        "rsx",
        "rux",
        "stk",
        "tab",
        "tip",
        "tlc",
        "upgrade",
        "wsm",
        "x402",
        "xrr",
        "xrr-php",
        "xrr-poly",
        "xrr-py",
        "xrr-rs",
        "xrr-ts",
      ]
    `);
  });

  it('category distribution snapshot', () => {
    const dist: Record<string, number> = {};
    for (const p of projects) {
      dist[p.category] = (dist[p.category] ?? 0) + 1;
    }
    expect(dist).toMatchInlineSnapshot(`
      {
        "ai": 3,
        "cli": 17,
        "core": 3,
        "cross-runtime": 6,
        "infra": 3,
        "sdk": 2,
      }
    `);
  });

  it('includes every docs-worker project in the site registry', () => {
    // Known projects that exist in docs-worker (P3) registry.
    // Update this list when docs-worker/src/projects.ts changes.
    const siteNames = new Set(projects.map((p) => p.name));
    const missingFromSite = documentedProjects.filter(
      (n) => !siteNames.has(n),
    );
    expect(
      missingFromSite,
      'docs-worker projects missing from site registry',
    ).toEqual([]);
  });

  it('documents the docs-worker subset at its canonical hub URLs', () => {
    for (const name of documentedProjects) {
      const project = projects.find((candidate) => candidate.name === name);
      expect(project?.docs).toBe(`https://docs.hop.top/${name}/`);
    }
  });
});
