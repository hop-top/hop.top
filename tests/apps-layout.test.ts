import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const readJson = (path: string) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));

describe("application layout", () => {
  it.each(["cli", "site", "router", "docs-router"])(
    "keeps %s as a self-contained app",
    (app) => {
      expect(existsSync(resolve(root, `apps/${app}/package.json`))).toBe(true);
      expect(existsSync(resolve(root, `apps/${app}/src`))).toBe(true);
    },
  );

  it.each(["src", "site", "worker", "docs-worker"])(
    "removes the legacy %s path",
    (path) => {
      expect(existsSync(resolve(root, path))).toBe(false);
    },
  );

  it("keeps repository orchestration separate from the CLI package", () => {
    const workspace = readJson("package.json");
    const cli = readJson("apps/cli/package.json");

    expect(workspace.private).toBe(true);
    expect(workspace.bin).toBeUndefined();
    expect(cli.name).toBe("hop.top");
    expect(cli.bin).toEqual({ "hop.top": "dist/index.js" });
  });

  it("deploys the router from its application directory", () => {
    const deploy = readFileSync(
      resolve(root, ".github/workflows/deploy-router.yml"),
      "utf8",
    );
    const vanity = readFileSync(
      resolve(root, ".github/workflows/vanity-test.yml"),
      "utf8",
    );

    expect(existsSync(resolve(root, ".github/workflows/deploy-worker.yml")))
      .toBe(false);
    expect(deploy).toContain("apps/router/**");
    expect(deploy).toContain("workingDirectory: apps/router");
    expect(vanity).toContain('workflows: ["Deploy Router"]');
  });
});
