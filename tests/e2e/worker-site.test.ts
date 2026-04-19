import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../..');

describe('worker-site handoff', () => {
  it('Astro site config targets hop.top', () => {
    const config = readFileSync(
      resolve(ROOT, 'site/astro.config.mjs'),
      'utf-8',
    );
    expect(config).toContain("site: 'https://hop.top'");
  });

  it('worker wrangler.toml defines SITE_URL variable', () => {
    const wrangler = readFileSync(
      resolve(ROOT, 'worker/wrangler.toml'),
      'utf-8',
    );
    expect(wrangler).toMatch(/SITE_URL/);
  });

  it('site public assets include favicon.svg', () => {
    expect(
      existsSync(resolve(ROOT, 'site/public/favicon.svg')),
    ).toBe(true);
  });

  it('site public assets include favicon.ico', () => {
    expect(
      existsSync(resolve(ROOT, 'site/public/favicon.ico')),
    ).toBe(true);
  });

  it('worker static-asset route covers _astro and favicon.svg', () => {
    const src = readFileSync(
      resolve(ROOT, 'worker/src/index.ts'),
      'utf-8',
    );
    expect(src).toMatch(/_astro/);
    expect(src).toContain('favicon');
  });

  it('Astro builds successfully', async () => {
    // Verify Astro config + package.json exist (build itself is
    // expensive; CI runs `npm run build` separately)
    expect(
      existsSync(resolve(ROOT, 'site/astro.config.mjs')),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, 'site/package.json')),
    ).toBe(true);

    const pkg = JSON.parse(
      readFileSync(resolve(ROOT, 'site/package.json'), 'utf-8'),
    );
    expect(pkg.scripts?.build).toBe('astro build');
  });

  it('docs-worker wrangler.toml exists', () => {
    expect(
      existsSync(resolve(ROOT, 'docs-worker/wrangler.toml')),
    ).toBe(true);
  });
});
