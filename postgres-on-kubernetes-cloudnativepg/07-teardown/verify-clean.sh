#!/usr/bin/env bash
# verify-clean.sh — confirm nothing from the demo is left running. Read-only:
# it reports what it finds and fixes nothing.
#
#   07-teardown/verify-clean.sh
set -uo pipefail

cluster_name="pg-workshop-demo"

echo "== verify-clean: postgres-on-kubernetes-cloudnativepg =="

if ! command -v kind >/dev/null 2>&1; then
  echo "FAIL: kind is not installed or not on PATH — cannot verify the kind cluster is gone"
  exit 1
fi

clusters="$(kind get clusters 2>/dev/null || true)"
if echo "$clusters" | grep -qx "$cluster_name"; then
  echo "FAIL: kind still lists cluster '$cluster_name'"
  echo "remove it manually with: kind delete cluster --name $cluster_name"
  exit 1
fi

echo "PASS: no '$cluster_name' kind cluster remains"
