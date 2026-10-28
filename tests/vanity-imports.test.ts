import { describe, it, expect, vi, afterEach } from "vitest";
import app, { goVanity } from "../apps/router/src/index.js";

const ENV = { SITE_URL: "https://site.example" };
const goGet = (path: string) =>
  app.request(`https://hop.top${path}?go-get=1`, {}, ENV);

describe("vanity subpaths", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serves the root module go-import for a subpath", async () => {
    const res = await goGet("/nerv/sdk/go");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain(
      '<meta name="go-import" content="hop.top/nerv git https://github.com/hop-top/nerv">',
    );
    expect(html).toContain(
      '<meta name="go-source" content="hop.top/nerv https://github.com/hop-top/nerv ',
    );
  });

  it("serves the root module go-import for a deep subpath", async () => {
    const res = await goGet("/kit/go/console/cli/internal");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain(
      'content="hop.top/kit git https://github.com/hop-top/kit"',
    );
  });

  it("treats an unknown package's subpath like the unknown package", async () => {
    for (const pkg of ["x999", "spec-crtx", "brand-new"]) {
      const root = await goGet(`/${pkg}`);
      const sub = await goGet(`/${pkg}/a/b`);
      expect(sub.status).toBe(root.status);
      expect(await sub.text()).toBe(await root.text());
    }
  });

  it("leaves non-go-get subpaths to the site proxy", async () => {
    const fetchSpy = vi.fn(async () => new Response("site page"));
    vi.stubGlobal("fetch", fetchSpy);
    const res = await app.request("https://hop.top/nerv/sdk/go", {}, ENV);
    expect(await res.text()).toBe("site page");
    expect(fetchSpy).toHaveBeenCalledOnce();
    const proxied = fetchSpy.mock.calls[0][0] as Request;
    expect(proxied.url).toBe("https://site.example/nerv/sdk/go");
  });
});

describe("goVanity", () => {
  it("generates correct go-import meta tag", () => {
    const html = goVanity(
      "hop.top/kit",
      "https://github.com/hop-top/kit",
    );
    expect(html).toContain(
      '<meta name="go-import" content="hop.top/kit git https://github.com/hop-top/kit">',
    );
  });

  it("generates correct go-source meta tag", () => {
    const html = goVanity(
      "hop.top/tlc",
      "https://github.com/hop-top/tlc",
    );
    expect(html).toContain(
      '<meta name="go-source" content="hop.top/tlc https://github.com/hop-top/tlc'
      + " https://github.com/hop-top/tlc/tree/main{/dir}"
      + ' https://github.com/hop-top/tlc/blob/main{/dir}/{file}#L{line}">',
    );
  });

  it("includes redirect to repo URL", () => {
    const html = goVanity(
      "hop.top/hdl",
      "https://github.com/hop-top/hdl",
    );
    expect(html).toContain('content="3; url=https://github.com/hop-top/hdl"');
    expect(html).toContain(
      '<a href="https://github.com/hop-top/hdl">',
    );
  });

  it("handles submodule import paths", () => {
    const html = goVanity(
      "hop.top/xrr-poly/go",
      "https://github.com/hop-top/xrr-poly",
    );
    expect(html).toContain(
      'content="hop.top/xrr-poly/go git https://github.com/hop-top/xrr-poly"',
    );
    expect(html).toContain(
      'content="hop.top/xrr-poly/go https://github.com/hop-top/xrr-poly',
    );
  });

  it("returns valid HTML document", () => {
    const html = goVanity(
      "hop.top/uri",
      "https://github.com/hop-top/uri",
    );
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html>");
    expect(html).toContain("</html>");
  });

  it("does not inject extra content for clean package names", () => {
    const html = goVanity(
      "hop.top/kit",
      "https://github.com/hop-top/kit",
    );
    // import path appears exactly as given
    expect(html).not.toContain("hop.top/kit/");
    // no double slashes in URLs
    expect(html).not.toContain("github.com//");
  });

  it("has well-formed HTML with closing tags", () => {
    const html = goVanity(
      "hop.top/kit",
      "https://github.com/hop-top/kit",
    );
    expect(html).toContain("<head>");
    expect(html).toContain("</head>");
    expect(html).toContain("<body>");
    expect(html).toContain("</body>");
    expect(html).toContain("<html>");
    expect(html).toContain("</html>");
    expect(html).toContain("</a>");
  });

  it("escapes special characters in package and repository values", () => {
    const html = goVanity(
      'hop.top/<script>alert("xss")</script>',
      'https://github.com/hop-top/evil" onclick="alert(1)',
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('onclick="alert(1)');
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot; onclick=&quot;alert(1)");
  });

  it("handles empty string inputs without crashing", () => {
    const html = goVanity("", "");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
    expect(html).toContain('content=" git "');
  });

  it("never produces double slashes in import path", () => {
    const cases = [
      ["hop.top/kit", "https://github.com/hop-top/kit"],
      ["hop.top/kit/", "https://github.com/hop-top/kit"],
      ["hop.top/xrr-poly/go", "https://github.com/hop-top/xrr-poly"],
    ] as const;
    for (const [importPath, repoUrl] of cases) {
      const html = goVanity(importPath, repoUrl);
      // import path portion should not have //
      const importMatch = html.match(
        /content="([^ ]+) git/,
      );
      expect(importMatch).not.toBeNull();
      expect(importMatch![1]).not.toContain("//");
    }
  });
});
