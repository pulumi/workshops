#!/usr/bin/env bash
set -euo pipefail
# Sends one request per second to the service and reports every status code. Stop with Ctrl-C.
# shellcheck source=../lib.sh
source "$(dirname "$0")/../lib.sh"

url="$(stack_output albUrl)"
ok=0
failed=0
trap 'echo; echo "ok=$ok failed=$failed"; exit 0' INT TERM
while true; do
  code="$(curl -s -o /dev/null -m 3 -w '%{http_code}' "$url" || true)"
  if [ "$code" = "200" ]; then ok=$((ok + 1)); else failed=$((failed + 1)); fi
  echo "$(date +%T) $code (ok=$ok failed=$failed)"
  sleep 1
done
