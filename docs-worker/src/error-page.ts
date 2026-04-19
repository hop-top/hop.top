/**
 * Error/not-found page for packages without deployed docs.
 */
export function errorPage(pkg: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${pkg} - docs not available</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #050510;
      color: #c0c0d0;
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
    }
    .card {
      text-align: center;
      padding: 3rem;
      border: 1px solid #1a1a2e;
      border-radius: 8px;
      background: #0a0a14;
      max-width: 480px;
    }
    .card h1 {
      font-size: 1.25rem;
      color: #e0e0e0;
      margin-bottom: 0.75rem;
    }
    .card p {
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .card code {
      background: #111;
      padding: 0.15em 0.4em;
      border-radius: 3px;
      color: #00e5ff;
    }
    .back {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      border: 1px solid #00e5ff;
      border-radius: 4px;
      color: #00e5ff;
      text-decoration: none;
      font-size: 0.8125rem;
      transition: background 0.15s;
    }
    .back:hover { background: rgba(0, 229, 255, 0.08); }
  </style>
</head>
<body>
  <div class="card">
    <h1>docs not deployed yet</h1>
    <p>
      Documentation for <code>${pkg}</code> has not been
      published to <code>${pkg}.hop.top</code>.
    </p>
    <a class="back" href="/">browse all packages</a>
  </div>
</body>
</html>`
}
