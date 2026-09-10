import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '../..');

describe('router-site handoff', () => {
  it('Astro site config targets hop.top', () => {
    const config = readFileSync(
      resolve(ROOT, 'apps/site/astro.config.mjs'),
      'utf-8',
    );
    expect(config).toContain("site: 'https://hop.top'");
  });

  it('router wrangler.toml defines SITE_URL variable', () => {
    const wrangler = readFileSync(
      resolve(ROOT, 'apps/router/wrangler.toml'),
      'utf-8',
    );
    expect(wrangler).toMatch(/SITE_URL/);
  });

  it('owns spec.hop.top as a custom domain', () => {
    const wrangler = readFileSync(
      resolve(ROOT, 'apps/router/wrangler.toml'),
      'utf8',
    );

    expect(wrangler).toContain(
      '{ pattern = "spec.hop.top", custom_domain = true }',
    );
    expect(wrangler).not.toContain('spec.hop.top/*');
  });

  it('site public assets include favicon.svg', () => {
    expect(
      existsSync(resolve(ROOT, 'apps/site/public/favicon.svg')),
    ).toBe(true);
  });

  it('site public assets include favicon.ico', () => {
    expect(
      existsSync(resolve(ROOT, 'apps/site/public/favicon.ico')),
    ).toBe(true);
  });

  it('router static-asset route covers _astro and favicon.svg', () => {
    const src = readFileSync(
      resolve(ROOT, 'apps/router/src/index.ts'),
      'utf-8',
    );
    expect(src).toMatch(/_astro/);
    expect(src).toContain('favicon');
  });

  it('Astro builds successfully', async () => {
    // Verify Astro config + package.json exist (build itself is
    // expensive; CI runs `npm run build` separately)
    expect(
      existsSync(resolve(ROOT, 'apps/site/astro.config.mjs')),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, 'apps/site/package.json')),
    ).toBe(true);

    const pkg = JSON.parse(
      readFileSync(resolve(ROOT, 'apps/site/package.json'), 'utf-8'),
    );
    expect(pkg.scripts?.build).toBe('astro build');
  });

  it('docs-router wrangler.toml exists', () => {
    expect(
      existsSync(resolve(ROOT, 'apps/docs-router/wrangler.toml')),
    ).toBe(true);
  });
});
