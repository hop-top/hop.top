#!/usr/bin/env bash
set -euo pipefail

SCRIPT="$(cd "$(dirname "$0")/.." && pwd)/scripts/scaffold-register.sh"
PASS=0
FAIL=0
ERRORS=()

pass() { PASS=$((PASS + 1)); echo "  PASS: $1"; }
fail() { FAIL=$((FAIL + 1)); ERRORS+=("$1"); echo "  FAIL: $1"; }

# Run command, expect non-zero exit; check output contains needle
assert_fails_with() {
  local desc="$1" needle="$2"; shift 2
  local output
  if output=$("$@" 2>&1); then
    fail "${desc}: expected non-zero exit"
    return
  fi
  if echo "$output" | grep -qF "$needle"; then
    pass "${desc}"
  else
    fail "${desc}: expected '${needle}' in output"
  fi
}

echo "=== scaffold-register.sh argument tests ==="

# No arguments => usage error
assert_fails_with "no args shows usage" "usage:" bash "$SCRIPT"

# Too many arguments
assert_fails_with "too many args shows usage" "usage:" bash "$SCRIPT" foo bar

# Invalid project names
assert_fails_with "uppercase rejected" "invalid project name" \
  bash "$SCRIPT" "MyProject"

assert_fails_with "underscore rejected" "invalid project name" \
  bash "$SCRIPT" "my_project"

assert_fails_with "starts with hyphen" "invalid project name" \
  bash "$SCRIPT" "-bad"

assert_fails_with "starts with number" "invalid project name" \
  bash "$SCRIPT" "9bad"

assert_fails_with "special chars rejected" "invalid project name" \
  bash "$SCRIPT" "my@pkg"

assert_fails_with "empty string rejected" "invalid project name" \
  bash "$SCRIPT" ""

echo
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="

if [ "${FAIL}" -gt 0 ]; then
  echo
  echo "Failures:"
  for err in "${ERRORS[@]}"; do
    echo "  - ${err}"
  done
  exit 1
fi
