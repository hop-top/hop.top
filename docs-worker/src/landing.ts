import { PROJECTS, type Project } from './projects'

const CATEGORY_LABELS: Record<Project['category'], string> = {
  core: 'Core',
  tooling: 'Tooling',
  runtime: 'Runtime',
  'language-sdk': 'Language SDKs',
}

const CATEGORY_ORDER: Project['category'][] = [
  'core',
  'tooling',
  'runtime',
  'language-sdk',
]

function projectCard(p: Project): string {
  return `<a href="/${p.slug}/" class="card">
  <div class="card-head">
    <span class="card-name">${p.name}</span>
    <span class="card-host">${p.docsHost}</span>
  </div>
  <p class="card-desc">${p.description}</p>
</a>`
}

function categorySection(category: Project['category']): string {
  const items = PROJECTS.filter((p) => p.category === category)
  if (items.length === 0) return ''
  return `<section class="cat">
  <h2>${CATEGORY_LABELS[category]}</h2>
  <div class="grid">${items.map(projectCard).join('\n')}</div>
</section>`
}

export function landingPage(): string {
  const sections = CATEGORY_ORDER.map(categorySection).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>hop.top docs</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      background: #050510;
      color: #c0c0d0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
    }

    .wrap {
      max-width: 960px;
      margin: 0 auto;
      padding: 3rem 1.5rem 4rem;
    }

    header {
      margin-bottom: 3rem;
    }

    header h1 {
      font-size: 1.75rem;
      color: #e0e0e0;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin-bottom: 0.5rem;
    }

    header h1 span { color: #00e5ff; }

    header p {
      color: #666;
      font-size: 0.8125rem;
    }

    .search-box {
      margin-bottom: 2.5rem;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #0a0a14;
      border: 1px solid #1a1a2e;
      border-radius: 6px;
      color: #c0c0d0;
      font-family: inherit;
      font-size: 0.8125rem;
      outline: none;
      transition: border-color 0.15s;
    }

    .search-box input:focus {
      border-color: #00e5ff;
    }

    .search-box input::placeholder {
      color: #444;
    }

    .cat { margin-bottom: 2.5rem; }

    .cat h2 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #555;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #111;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.75rem;
    }

    .card {
      display: block;
      padding: 1rem 1.25rem;
      background: #0a0a14;
      border: 1px solid #1a1a2e;
      border-radius: 6px;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s, background 0.15s;
    }

    .card:hover {
      border-color: #00e5ff;
      background: #0c0c1a;
    }

    .card-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .card-name {
      font-weight: 700;
      color: #e0e0e0;
      font-size: 0.9375rem;
    }

    .card-host {
      font-size: 0.6875rem;
      color: #444;
    }

    .card-desc {
      font-size: 0.8125rem;
      color: #777;
    }

    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #111;
      text-align: center;
      font-size: 0.75rem;
      color: #333;
    }

    footer a {
      color: #00e5ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1><span>hop.top</span> / docs</h1>
      <p>Unified documentation for the hop ecosystem</p>
    </header>

    <div class="search-box">
      <input
        type="search"
        placeholder="search docs (coming soon)..."
        disabled
        aria-label="Search documentation"
      >
    </div>

    ${sections}

    <footer>
      <a href="https://hop.top">hop.top</a>
       &middot;
      <a href="https://github.com/hop-top">github</a>
    </footer>
  </div>

  <script>
    // Client-side filter (lightweight, no deps)
    const input = document.querySelector('.search-box input')
    if (input) {
      input.disabled = false
      input.placeholder = 'filter packages...'
      input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase()
        document.querySelectorAll('.card').forEach((card) => {
          const text = card.textContent.toLowerCase()
          card.style.display = text.includes(q) ? '' : 'none'
        })
      })
    }
  </script>
</body>
</html>`
}
