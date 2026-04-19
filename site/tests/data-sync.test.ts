import { describe, it, expect } from 'vitest';
import { projects } from '../src/data/projects';

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
        "cxr",
        "eva",
        "eva-ee",
        "eva-pkg",
        "git",
        "gym",
        "hdl",
        "hdox",
        "hop",
        "ibr",
        "kit",
        "mde",
        "mdl",
        "par",
        "rlz",
        "rsx",
        "rux",
        "stk",
        "tab",
        "tip",
        "tlc",
        "upgrade",
        "uri",
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
        "core": 4,
        "cross-runtime": 6,
        "infra": 2,
        "sdk": 2,
      }
    `);
  });

  it('all projects present in site registry are documented', () => {
    // Known projects that exist in docs-worker (P3) registry.
    // Update this list when docs-worker/src/projects.ts changes.
    const docsWorkerProjects = [
      'aps', 'eva', 'gym', 'hdl', 'ibr', 'kit',
      'rsx', 'tlc', 'uri', 'wsm', 'xrr',
      'xrr-php', 'xrr-py', 'xrr-rs', 'xrr-ts',
    ];

    const siteNames = new Set(projects.map((p) => p.name));
    const missingFromSite = docsWorkerProjects.filter(
      (n) => !siteNames.has(n),
    );
    expect(
      missingFromSite,
      'docs-worker projects missing from site registry',
    ).toEqual([]);
  });
});
