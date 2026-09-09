.PHONY: build test lint links check install setup post-create \
       dev dev-start dev-stop \
       promote promote-alpha promote-beta promote-rc \
       promote-release

SITE_HOST ?= 0.0.0.0
SITE_PORT ?= 4321
SITE_SESSION ?= hop-top-site
SITE_LOG_FILE ?= /tmp/hop-top-site.log
SITE_TMUX_DIR ?= /tmp/ht-tmux

check: lint test build links

build:
	npm run build
	pnpm --dir docs-worker typecheck
	npm --prefix site run build

test:
	npm test
	npm --prefix worker test
	pnpm --dir docs-worker test
	npm --prefix site test
	npm run test:e2e

lint:
	npm run lint

links:
	@if command -v lychee >/dev/null 2>&1; then \
		lychee --no-progress .; \
	else \
		echo "lychee not installed; skipping link check"; \
	fi

install:
	npm ci
	npm --prefix worker ci
	pnpm --dir docs-worker install --frozen-lockfile
	npm --prefix site ci

setup: install

post-create: install
	$(MAKE) dev-start

dev:
	npm --prefix site run dev -- --host $(SITE_HOST) --port $(SITE_PORT)

dev-start:
	@mkdir -p "$(SITE_TMUX_DIR)"
	@if TMUX_TMPDIR="$(SITE_TMUX_DIR)" \
		tmux has-session -t "$(SITE_SESSION)" 2>/dev/null; then \
		echo "hop.top site already running on http://localhost:$(SITE_PORT)"; \
	else \
		TMUX_TMPDIR="$(SITE_TMUX_DIR)" \
		tmux new-session -d -s "$(SITE_SESSION)" \
			"npm --prefix site run dev -- --host '$(SITE_HOST)' \
			--port '$(SITE_PORT)' > '$(SITE_LOG_FILE)' 2>&1"; \
		sleep 1; \
		if TMUX_TMPDIR="$(SITE_TMUX_DIR)" \
			tmux has-session -t "$(SITE_SESSION)" 2>/dev/null; then \
			echo "hop.top site started on http://localhost:$(SITE_PORT)"; \
			echo "log: $(SITE_LOG_FILE)"; \
		else \
			cat "$(SITE_LOG_FILE)"; \
			exit 1; \
		fi; \
	fi

dev-stop:
	@if TMUX_TMPDIR="$(SITE_TMUX_DIR)" \
		tmux has-session -t "$(SITE_SESSION)" 2>/dev/null; then \
		TMUX_TMPDIR="$(SITE_TMUX_DIR)" \
		tmux kill-session -t "$(SITE_SESSION)"; \
		echo "hop.top site stopped"; \
	else \
		echo "hop.top site is not running"; \
	fi

promote:
	@scripts/promote-release.sh

promote-alpha promote-beta promote-rc promote-release:
	@scripts/promote-release.sh $(subst promote-,,$@)
