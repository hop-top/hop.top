import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { friendGroups, friends } from '../src/data/friends';
import { projects } from '../src/data/projects';

const friendsPage = readFileSync(
  new URL('../src/pages/friends.astro', import.meta.url),
  'utf8',
);
const layout = readFileSync(
  new URL('../src/layouts/Base.astro', import.meta.url),
  'utf8',
);

describe('friends page', () => {
  it('lists every friend once, in a named group', () => {
    expect(friends.length).toBeGreaterThan(0);
    for (const group of friendGroups) {
      expect(group.label.trim()).not.toBe('');
      expect(group.friends.length).toBeGreaterThan(0);
    }
    const names = friends.map((friend) => friend.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('uses plain https links without tracking parameters', () => {
    for (const friend of friends) {
      const url = new URL(friend.url);
      expect(url.protocol, friend.name).toBe('https:');
      expect(url.search, friend.name).toBe('');
      expect(url.hash, friend.name).toBe('');
    }
  });

  it('states what each project is and how our tools relate to it', () => {
    for (const friend of friends) {
      expect(friend.what.trim(), friend.name).not.toBe('');
      expect(friend.relation.trim(), friend.name).not.toBe('');
      expect(friend.tools.length, friend.name).toBeGreaterThan(0);
    }
  });

  it('names only hop.top tools that have a catalog page', () => {
    const slugs = new Set(projects.map((project) => project.name));
    for (const friend of friends) {
      for (const tool of friend.tools) {
        expect(slugs, `${friend.name} -> ${tool}`).toContain(tool);
      }
    }
  });

  it('claims no partnership or endorsement', () => {
    for (const friend of friends) {
      const text = `${friend.what} ${friend.relation}`;
      expect(text, friend.name).not.toMatch(/partner|endorse|official|sponsor/i);
    }
  });

  it('renders followable links', () => {
    expect(friendsPage).not.toMatch(/nofollow|ugc|sponsored/);
    expect(friendsPage).toContain('href={friend.url}');
  });

  it('is linked from the shared footer', () => {
    expect(layout).toMatch(/<footer[\s\S]*href="\/friends"[\s\S]*<\/footer>/);
  });
});
