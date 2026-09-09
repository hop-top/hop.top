import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    include: ['tests/e2e/**/*.test.ts'],
    root: path.resolve(__dirname, '../..'),
  },
  resolve: {
    alias: {
      '@router': path.resolve(__dirname, '../../apps/router/src'),
      '@site': path.resolve(__dirname, '../../apps/site/src'),
      '@docs-router': path.resolve(__dirname, '../../apps/docs-router/src'),
    },
  },
});
