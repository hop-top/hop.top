#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${HOP_TOP_URL:-https://hop.top}"
PASS=0
FAIL=0
ERRORS=()

# Known packages to test (subset of repos.ts)
PACKAGES=(
  kit tlc hdl uri aps cxr xrr xrr-ts xrr-rs xrr-php xrr-py
  xrr-poly git ibr mdl rux ben aom rlz stk upgrade wsm tip
  eva eva-pkg eva-ee hop rsx par gym mde tab hdox
)

# Submodule vanity: key=import-path value=expected-repo
declare -A SUBMODULES=(
  ["xrr-poly/go"]="https://github.com/hop-top/xrr-poly"
)

pass() { ((PASS++)); echo "  PASS: $1"; }
fail() { ((FAIL++)); ERRORS+=("$1"); echo "  FAIL: $1"; }

check_vanity() {
  local pkg="$1"
  local expected_repo="https://github.com/hop-top/${pkg%%/*}"
  local import_path="hop.top/${pkg}"

  # Allow override for submodules
  if [ "${2:-}" != "" ]; then
    expected_repo="$2"
  fi

  echo "Testing ${import_path}..."

  local response
  response=$(curl -sS -w "\n%{http_code}" "${BASE_URL}/${pkg}?go-get=1" 2>&1) || {
    fail "${pkg}: curl failed"
    return
  }

  local http_code body
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  # HTTP 200
  if [ "$http_code" != "200" ]; then
    fail "${pkg}: expected HTTP 200, got ${http_code}"
    return
  fi
  pass "${pkg}: HTTP 200"

  # go-import meta tag
  local expected_import="hop.top/${pkg} git ${expected_repo}"
  if echo "$body" | grep -q "content=\"${expected_import}\""; then
    pass "${pkg}: go-import meta tag"
  else
    fail "${pkg}: go-import meta tag missing or wrong"
  fi

  # go-source meta tag
  if echo "$body" | grep -q "name=\"go-source\".*content=\"hop.top/${pkg}"; then
    pass "${pkg}: go-source meta tag"
  else
    fail "${pkg}: go-source meta tag missing or wrong"
  fi
}

check_negative() {
  local pkg="$1"
  echo "Testing negative: ${pkg}..."

  local http_code
  http_code=$(curl -sS -o /dev/null -w "%{http_code}" \
    "${BASE_URL}/${pkg}?go-get=1" 2>&1) || {
    fail "negative ${pkg}: curl failed"
    return
  }

  if [ "$http_code" = "404" ]; then
    pass "negative ${pkg}: HTTP 404"
  else
    fail "negative ${pkg}: expected 404, got ${http_code}"
  fi
}

echo "=== Go Vanity Import E2E Tests ==="
echo "Target: ${BASE_URL}"
echo

# Test all known packages
for pkg in "${PACKAGES[@]}"; do
  check_vanity "$pkg"
done

# Test submodule vanity imports
for pkg in "${!SUBMODULES[@]}"; do
  check_vanity "$pkg" "${SUBMODULES[$pkg]}"
done

# Negative cases
echo
echo "--- Negative cases ---"
check_negative "nonexistent-package-xyz"
check_negative "x999"

echo
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="

if [ ${FAIL} -gt 0 ]; then
  echo
  echo "Failures:"
  for err in "${ERRORS[@]}"; do
    echo "  - ${err}"
  done
  exit 1
fi
