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
| `docs.hop.top/<package>` | Published project docs, proxied from `<package>.hop.top` |
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

Requirements: Node.js 22 or newer and npm. The site requires Node.js 22.12 or newer.

### Dev container

Open the repository in a compatible Dev Container client and choose **Reopen in Container**.
The container installs Devbox and activates its pinned Node 22 environment for
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
npm --prefix apps/docs-router install
npm --prefix apps/site install
```

Run the same checks represented in CI:

```sh
npm run lint
npm test
npm --prefix apps/router test
npm --prefix apps/docs-router test
npm --prefix apps/site test
npm run test:e2e
npm --prefix apps/cli run build
npm --prefix apps/site run build
```

Run a service locally:

```sh
npm --prefix apps/router run dev
npm --prefix apps/docs-router run dev
npm --prefix apps/site run dev
```

## Adding or updating a project

The public catalog is explicitly curated. Organization membership, repository
visibility, or a vanity homepage does not add a project automatically.

1. Add only a project that has been explicitly selected for the catalog.
2. Copy its canonical repository URL and description verbatim from GitHub
   metadata. When the description is empty, use the project's authored README;
   do not write substitute marketing copy.
3. Add install instructions only when an authoritative package or release
   source confirms them.
4. For a documentation site, add its slug to the routable set in
   `apps/docs-router/src/projects.ts` so `docs.hop.top/<package>` activates when
   `<package>.hop.top` is published. Specification repositories do not use this
   route; set their canonical `spec.hop.top/<name>/<version>/<file>` URL instead.
5. Only after verifying a documentation origin, add its metadata to the published docs
   registry and set the canonical `docs` URL in the marketing catalog. This is
   what adds it to the docs landing page, sitemaps, and agent indexes.
6. Run the site, docs router, and cross-component tests.
7. Confirm `hop.top/<package>?go-get=1` resolves to the intended repository.

The current registries are checked in and maintained manually. Tests pin the
public catalog and its GitHub-sourced descriptions. The
[architecture document](docs/ARCHITECTURE.md#github-backed-generation) describes the planned
path to generating a single deterministic registry from GitHub repository metadata plus
explicit overrides.

The site build automatically regenerates its sitemap, crawler policy, and agent index from
the configured site URL and project registry. The docs router derives the same artifacts for
`docs.hop.top` from its verified published-docs registry. Route-ready but unpublished projects
are not advertised. Neither surface emits deployment timestamps, synthetic modification dates,
or commit references, so unchanged source data produces unchanged discovery output.

## Deployment

Merges to `main` that change `apps/router/` automatically deploy the main edge router. Successful
deployments trigger live vanity-import checks; those checks also run weekly.

The site is configured as the `hop-top-site` Cloudflare Pages project. Its
Cloudflare build root must be `apps/site`. The docs router has its own Wrangler
configuration, owns `docs.hop.top` as a custom domain, and can be deployed with
`npm --prefix apps/docs-router run deploy`. It has no automatic deployment workflow
in this repository.

Cloudflare credentials are required for manual deployment. Never commit Worker secrets.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

Apache-2.0. See [LICENSE](LICENSE).
