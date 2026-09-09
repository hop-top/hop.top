# hop.top

Ecosystem hub — marketing site, edge router, Go vanity imports.

[![CI](https://github.com/hop-top/hop.top/actions/workflows/ci.yml/badge.svg)](https://github.com/hop-top/hop.top/actions/workflows/ci.yml)

## What it does

hop.top gives the [hop-top](https://github.com/hop-top) project family one public namespace:

| URL | Behavior |
|---|---|
| [`hop.top`](https://hop.top) | Ecosystem site and project landing pages |
| `hop.top/<package>?go-get=1` | Go vanity-import metadata |
| [`docs.hop.top`](https://docs.hop.top) | Unified project documentation gateway |
| `spec.hop.top/<name>/<version>/<file>` | Canonical, versioned specification files |
| [`hop.top/sitemap-index.xml`](https://hop.top/sitemap-index.xml), [`robots.txt`](https://hop.top/robots.txt), [`llms.txt`](https://hop.top/llms.txt) | Ecosystem search and agent discovery |
| [`docs.hop.top/sitemap.xml`](https://docs.hop.top/sitemap.xml), [`robots.txt`](https://docs.hop.top/robots.txt), [`llms.txt`](https://docs.hop.top/llms.txt) | Documentation search and agent discovery |

Go package metadata resolves directly to the canonical
`github.com/hop-top/<package>` mirror. Ordinary package URLs serve the
corresponding landing page.

## Components

| Component | Purpose | Platform |
|---|---|---|
| [`apps/router/`](apps/router/) | Main routing, vanity imports, specification delivery | Cloudflare Workers |
| [`apps/site/`](apps/site/) | Static ecosystem and package pages | Astro and Cloudflare Pages |
| [`apps/docs-router/`](apps/docs-router/) | Documentation index, proxying, and shared navigation | Cloudflare Workers |
| [`apps/cli/`](apps/cli/) | Minimal `hop.top` command shell | Node.js |

See [the architecture document](docs/ARCHITECTURE.md) for request flow, routing precedence,
configuration, trust boundaries, and the registry model.

## Development

Requirements: Node.js 22 or newer, npm, and pnpm 10. The site requires Node.js 22.12 or newer.

### Dev container

Open the repository in a compatible Dev Container client and choose **Reopen in Container**.
The container installs Devbox, activates its pinned Node 22 and pnpm 10.33.4 environment for
terminal sessions, installs every project dependency, and starts the Astro site automatically.
Port 4321 is forwarded and opens as a preview.

The lifecycle commands are ordinary Make targets:

```sh
make post-create  # install all dependencies and start the site
make dev-start    # idempotently start the background site
make dev-stop
make check
```

The background server log is written to `/tmp/hop-top-site.log` inside the
container.

The same environment can be used without a container by installing Devbox and running
`devbox shell` from the repository root. npm is supplied by the pinned Node.js package.

### Manual setup

Install each deployable's dependencies:

```sh
npm install
npm --prefix apps/cli install
npm --prefix apps/router install
pnpm --dir apps/docs-router install --frozen-lockfile
npm --prefix apps/site install
```

Run the same checks represented in CI:

```sh
npm run lint
npm test
npm --prefix apps/router test
pnpm --dir apps/docs-router test
npm --prefix apps/site test
npm run test:e2e
npm --prefix apps/cli run build
npm --prefix apps/site run build
```

Run a service locally:

```sh
npm --prefix apps/router run dev
pnpm --dir apps/docs-router dev
npm --prefix apps/site run dev
```

## Adding or updating a project

1. Update `apps/site/src/data/projects.ts` for every project shown on hop.top.
2. If the project has a proxied documentation site, set its canonical `docs`
   URL and update `apps/docs-router/src/projects.ts` as well.
3. Run the site, docs router, and cross-component tests.
4. Confirm `hop.top/<package>?go-get=1` resolves to the intended repository.

The current registries are checked in and maintained manually. The
[architecture document](docs/ARCHITECTURE.md#github-backed-generation) describes the planned
path to generating a single deterministic registry from GitHub repository metadata plus
explicit overrides.

The site build automatically regenerates its sitemap, crawler policy, and agent index from
the configured site URL and project registry. The docs router derives the same artifacts for
`docs.hop.top` from its deployed documentation registry. Neither surface emits deployment
timestamps, synthetic modification dates, or commit references, so unchanged source data
produces unchanged discovery output.

## Deployment

Merges to `main` that change `apps/router/` automatically deploy the main edge router. Successful
deployments trigger live vanity-import checks; those checks also run weekly.

The site is configured as the `hop-top-site` Cloudflare Pages project. Its
Cloudflare build root must be `apps/site`. The docs router has its own Wrangler
configuration but no automatic deployment workflow in this repository.

Cloudflare credentials are required for manual deployment. Never commit Worker secrets.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

Apache-2.0. See [LICENSE](LICENSE).
