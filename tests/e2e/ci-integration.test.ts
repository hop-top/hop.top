import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(__dirname, '../..');
const WORKFLOWS = resolve(ROOT, '.github/workflows');

function loadWorkflow(name: string) {
  const path = resolve(WORKFLOWS, name);
  const raw = readFileSync(path, 'utf-8');
  return { raw, parsed: parseYaml(raw) };
}

describe('ci-integration: workflow files', () => {
  it('repo-map.yml exists and is valid YAML', () => {
    expect(existsSync(resolve(WORKFLOWS, 'repo-map.yml'))).toBe(true);
    const { parsed } = loadWorkflow('repo-map.yml');
    expect(parsed.name).toBeTruthy();
    expect(parsed.jobs).toBeTruthy();
  });

  it('repo-map.yml references generate-repo-map.sh', () => {
    const { raw } = loadWorkflow('repo-map.yml');
    expect(raw).toContain('scripts/generate-repo-map.sh');
  });

  it('repo-map.yml references the script that exists', () => {
    expect(
      existsSync(resolve(ROOT, 'scripts/generate-repo-map.sh')),
    ).toBe(true);
  });

  it('vanity-test.yml exists and is valid YAML', () => {
    expect(
      existsSync(resolve(WORKFLOWS, 'vanity-test.yml')),
    ).toBe(true);
    const { parsed } = loadWorkflow('vanity-test.yml');
    expect(parsed.name).toBeTruthy();
    expect(parsed.jobs).toBeTruthy();
  });

  it('vanity-test.yml references e2e script', () => {
    const { raw } = loadWorkflow('vanity-test.yml');
    expect(raw).toContain('tests/e2e/vanity-imports.sh');
  });

  it('repo-map.yml uses GH_TOKEN secret', () => {
    const { raw } = loadWorkflow('repo-map.yml');
    expect(raw).toContain('secrets.GH_TOKEN');
  });

  it('repo-map.yml uses CLOUDFLARE_API_TOKEN secret', () => {
    const { raw } = loadWorkflow('repo-map.yml');
    expect(raw).toContain('secrets.CLOUDFLARE_API_TOKEN');
  });

  it('ci.yml exists and is valid YAML', () => {
    expect(existsSync(resolve(WORKFLOWS, 'ci.yml'))).toBe(true);
    const { parsed } = loadWorkflow('ci.yml');
    expect(parsed.name).toBeTruthy();
    expect(parsed.jobs).toBeTruthy();
  });
});
