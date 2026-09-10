import { describe, it, expect } from 'vitest';
import { projects } from '../src/data/projects';

const githubCatalog = {
  agr: 'AGR is a V*-native, temporal, event-sourced, multi-agent orchestration runtime.',
  aps: 'Agent Profile System',
  axon: 'Host-CLI contract for AI-assistant hooks: identity, event maps, envelope and decision shapes, per CLI',
  ben: 'General-purpose benchmarking tool — answers "which approach is better, and by how much?" for any measurable task: tools, implementations, deps, LLM calls, agents.',
  c12n: 'Classification engine — LLM request classification with signal-based routing',
  cite: 'Polyglot toolkit for custom URI schemes (Go, TS, Python, Rust, PHP). Shared contract + parity-tested SDKs.',
  cxr: 'Capability eXecution Router — domain-agnostic dispatch runtime',
  eva: 'Distributed, extensible framework for testing, routing, and validating LLM-based agents.',
  fit: 'Train small advisor models to steer black-box LLMs without fine-tuning.',
  git: 'Deterministic, isolated, and reproducible multi-branch git worktree wrapper.',
  ibr: 'Human instructions translated into X-Path capable of finding the intended data even after a page structure or location change.',
  nerv: 'Write one hook. Run it on every AI coding CLI.',
  pod: 'Session, model, and tooling layer on top of any remote compute.',
  'spec-crtx': 'Language-agnostic specification for AI agent conversations',
  stem: 'Polyglot AI agent runtime — Go reference runtime + envelope SDKs for TS, Py, Rs, PHP. Implements crtx v0.1 (pronounced \'cortex\').',
  tip: 'Instantly transform any agent into a CLI token aware power user that never drifts.',
  tlc: 'IDE-agnostic todo list with full syncing with any issue tracking tool for tasks created remotely.',
  vein: 'Find any coding session across any AI assistant. One command.',
  wsm: 'IDE-agnostic workspace session manager allowing to start in Claude and resume in Gemini.',
  xat: 'Cross-Assistant Tester — cross-CLI conformance + regression harness for AI-assistant plugins (Claude Code, Gemini, Codex, OpenCode)',
  xrr: 'Generic multi-channel interaction recorder/replayer with a pluggable adapter interface.',
} as const;

describe('data sync baseline', () => {
  // Documents the current project set so drift between registries
  // (apps/site/src/data/projects.ts vs apps/docs-router/src/projects.ts)
  // is caught by a snapshot diff.

  it('project names snapshot', () => {
    const names = projects.map((p) => p.name).sort();
    expect(names).toMatchInlineSnapshot(`
      [
        "agr",
        "aps",
        "axon",
        "ben",
        "c12n",
        "cite",
        "cxr",
        "eva",
        "fit",
        "git",
        "ibr",
        "nerv",
        "pod",
        "spec-crtx",
        "stem",
        "tip",
        "tlc",
        "vein",
        "wsm",
        "xat",
        "xrr",
      ]
    `);
  });

  it('uses only the conservative public GitHub catalog and its descriptions', () => {
    expect(
      Object.fromEntries(
        projects.map((project) => [project.name, project.description]),
      ),
    ).toEqual(githubCatalog);
  });

  it('category distribution snapshot', () => {
    const dist: Record<string, number> = {};
    for (const p of projects) {
      dist[p.category] = (dist[p.category] ?? 0) + 1;
    }
    expect(dist).toMatchInlineSnapshot(`
      {
        "ai": 3,
        "cli": 9,
        "core": 1,
        "cross-runtime": 6,
        "infra": 2,
      }
    `);
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

  it('links spec-crtx to its canonical versioned specification', () => {
    const project = projects.find((candidate) => candidate.name === 'spec-crtx');

    expect(project).toMatchObject({
      spec: 'https://spec.hop.top/crtx/v0.1/envelope.md',
    });
    expect(project?.docs).toBeUndefined();
  });
});
