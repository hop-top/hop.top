#!/usr/bin/env bash
set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }
usage() { echo "usage: scaffold-register.sh <project-name>" >&2; exit 1; }

[ $# -eq 1 ] || usage

PROJECT="$1"

# Validate project name: lowercase alphanum + hyphens
[[ "$PROJECT" =~ ^[a-z][a-z0-9-]*$ ]] || \
  die "invalid project name: must be lowercase alphanumeric + hyphens"

command -v gh >/dev/null 2>&1 || die "gh CLI required"

# Verify repo exists in hop-top org
gh repo view "hop-top/${PROJECT}" --json name >/dev/null 2>&1 || \
  die "repo hop-top/${PROJECT} not found on GitHub"

echo "Triggering repo-map regeneration for hop-top/${PROJECT}..."
gh workflow run repo-map.yml \
  --repo hop-top/hop.top \
  -f reason="register ${PROJECT}" 2>/dev/null || \
  die "failed to dispatch repo-map workflow (check workflow exists)"

cat <<EOF

Done. Next steps:
  1. Wait for the repo-map workflow to complete
     gh run list --repo hop-top/hop.top --workflow repo-map.yml -L 1
  2. Deploy the worker (after repo-map PR merges)
  3. Verify vanity import works:
     curl -sI "https://hop.top/${PROJECT}?go-get=1"
     go list -m "hop.top/${PROJECT}@latest"
EOF
