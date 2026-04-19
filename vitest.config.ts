import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: [
      "worker/**",
      "site/**",
      "docs-worker/**",
      "tests/e2e/**",
      "node_modules/**",
    ],
  },
});
