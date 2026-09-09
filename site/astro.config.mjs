// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://hop.top',
  integrations: [
    sitemap({
      serialize(item) {
        // Freshness must describe content changes, not deployment time.
        item.lastmod = undefined;
        return item;
      },
    }),
  ],
});
