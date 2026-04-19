import { describe, it, expect } from "vitest";

// Mirror of worker/src/index.ts goVanity — kept in sync manually
function goVanity(importPath: string, repoUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="go-import" content="${importPath} git ${repoUrl}">
<meta name="go-source" content="${importPath} ${repoUrl} ${repoUrl}/tree/main{/dir} ${repoUrl}/blob/main{/dir}/{file}#L{line}">
<meta http-equiv="refresh" content="3; url=${repoUrl}">
</head>
<body>
Redirecting to <a href="${repoUrl}">${repoUrl}</a>...
</body>
</html>`;
}

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
});
