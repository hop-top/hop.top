import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const devcontainer = JSON.parse(
  readFileSync(resolve(root, ".devcontainer/devcontainer.json"), "utf8"),
);
const devbox = JSON.parse(
  readFileSync(resolve(root, "devbox.json"), "utf8"),
);
const makefile = readFileSync(resolve(root, "Makefile"), "utf8");
const gitignore = readFileSync(resolve(root, ".gitignore"), "utf8");
const dockerfile = readFileSync(
  resolve(root, ".devcontainer/Dockerfile"),
  "utf8",
);

describe("development container", () => {
  it("runs lifecycle commands inside the project Devbox environment", () => {
    expect(devcontainer.postCreateCommand).toBe(
      "devbox run -- make post-create",
    );
    expect(devcontainer.postStartCommand).toBe(
      "devbox run -- make dev-start",
    );
    expect(devcontainer.customizations.vscode.extensions).toContain(
      "jetpack-io.devbox",
    );
  });

  it("pins the JavaScript toolchain", () => {
    expect(devbox.packages).toContain("nodejs@22");
    expect(devbox.packages).not.toContain("pnpm@10.33.4");
    expect(dockerfile).toContain("ARG DEVBOX_VERSION=0.18.0");
    expect(dockerfile).toContain("ENV DEVBOX_USE_VERSION=${DEVBOX_VERSION}");
    expect(dockerfile).toContain("chmod 0755 /usr/local/bin/devbox");
    expect(dockerfile).toContain("--no-daemon");
    expect(dockerfile).toContain("/home/vscode/.nix-profile/bin");
    expect(dockerfile).toContain(
      "COPY --chown=vscode:vscode devbox.json devbox.lock",
    );
    expect(dockerfile).toContain(
      "devbox install --config /tmp/hop-top-devbox",
    );
  });

  it("installs every deployable and starts the forwarded site", () => {
    expect(makefile).toMatch(/^post-create: install$/m);
    expect(makefile).toContain("npm ci");
    expect(makefile).toContain("npm --prefix apps/cli ci");
    expect(makefile).toContain("npm --prefix apps/router ci");
    expect(makefile).toContain("npm --prefix apps/docs-router ci");
    expect(makefile).toContain("npm --prefix apps/site ci");
    expect(makefile).toMatch(/^dev-start:$/m);
    expect(makefile).toContain('tmux new-session -d -s "$(SITE_SESSION)"');
    expect(devcontainer.forwardPorts).toContain(4321);
    expect(gitignore).toMatch(/^\.pnpm-store\/$/m);
  });
});
