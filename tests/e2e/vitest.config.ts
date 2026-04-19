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
      '@worker': path.resolve(__dirname, '../../worker/src'),
      '@site': path.resolve(__dirname, '../../site/src'),
      '@docs-worker': path.resolve(__dirname, '../../docs-worker/src'),
    },
  },
});
