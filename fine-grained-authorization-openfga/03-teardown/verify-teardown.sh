#!/usr/bin/env bash
# Step 8: after `pulumi destroy`, confirm nothing is left behind.
set -euo pipefail

fail=0

if [ -n "$(docker ps -a --filter name=openfga-workshop --format '{{.Names}}')" ]; then
  echo "FAIL: container openfga-workshop still exists" >&2
  fail=1
else
  echo "ok: no openfga-workshop container"
fi

if curl -sS -o /dev/null --max-time 3 "${OPENFGA_API_URL:-http://localhost:8080}/healthz" 2>/dev/null; then
  echo "FAIL: something still answers on the OpenFGA API port" >&2
  fail=1
else
  echo "ok: OpenFGA API port is closed"
fi

exit "$fail"
