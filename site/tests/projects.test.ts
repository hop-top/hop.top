import { describe, it, expect } from 'vitest';
import { projects, categories, type Category } from '../src/data/projects';

const VALID_CATEGORIES: Category[] = [
  'core',
  'cli',
  'sdk',
  'cross-runtime',
  'infra',
  'ai',
];

describe('projects data', () => {
  it('has at least one project', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it('all projects have required fields', () => {
    for (const p of projects) {
      expect(p.name, `${p.name}: name`).toBeTruthy();
      expect(p.repo, `${p.name}: repo`).toBeTruthy();
      expect(p.description, `${p.name}: description`).toBeTruthy();
      expect(p.category, `${p.name}: category`).toBeTruthy();
    }
  });

  it('all repo URLs are valid hop-top GitHub URLs', () => {
    const pattern = /^https:\/\/github\.com\/hop-top\/[\w-]+$/;
    for (const p of projects) {
      expect(p.repo, `${p.name}: ${p.repo}`).toMatch(pattern);
    }
  });

  it('no duplicate project names', () => {
    const names = projects.map((p) => p.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('all categories are from the expected set', () => {
    for (const p of projects) {
      expect(
        VALID_CATEGORIES,
        `${p.name} has unknown category: ${p.category}`,
      ).toContain(p.category);
    }
  });

  it('install commands are non-empty when present', () => {
    for (const p of projects) {
      if (p.install !== undefined) {
        expect(p.install.trim(), `${p.name}: empty install`).not.toBe('');
      }
    }
  });
});

describe('categories metadata', () => {
  it('every category has label and color', () => {
    for (const [key, meta] of Object.entries(categories)) {
      expect(meta.label, `${key}: label`).toBeTruthy();
      expect(meta.color, `${key}: color`).toBeTruthy();
    }
  });

  it('categories keys match VALID_CATEGORIES', () => {
    const keys = Object.keys(categories).sort();
    expect(keys).toEqual([...VALID_CATEGORIES].sort());
  });
});
