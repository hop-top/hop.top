/**
 * Unified nav bar injected into all proxied docs pages.
 * Provides a link back to the hub and shows current project.
 */
export function navHeader(projectName: string, slug: string): string {
  return `<div id="hop-docs-nav" style="
    position: sticky;
    top: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1.5rem;
    background: #0a0a0a;
    border-bottom: 1px solid #1a1a2e;
    font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
    font-size: 0.8125rem;
    color: #a0a0b0;
  ">
    <a href="/" style="
      color: #00e5ff;
      text-decoration: none;
      font-weight: 700;
      letter-spacing: 0.05em;
    ">hop.top/docs</a>
    <span style="color: #333;">|</span>
    <span style="color: #e0e0e0; font-weight: 500;">${projectName}</span>
    <a href="/${slug}/" style="
      color: #666;
      text-decoration: none;
      margin-left: auto;
      font-size: 0.75rem;
    ">${slug}.hop.top</a>
  </div>`
}
