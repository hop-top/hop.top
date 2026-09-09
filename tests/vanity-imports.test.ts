import { describe, it, expect } from "vitest";
import { goVanity } from "../worker/src/index.js";

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
