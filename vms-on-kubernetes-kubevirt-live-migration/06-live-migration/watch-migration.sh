#!/usr/bin/env bash
# watch-migration.sh — watch the VirtualMachineInstanceMigration object until
# it succeeds, then show which node the VMI now runs on so it can be compared
# against the pre-migration node.
#
#   06-live-migration/watch-migration.sh
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

have kubectl || die "kubectl is not installed or not on PATH"

say "watching vmim (timeout 120s)"
timeout 120 kubectl get vmim -w || true

# This demo triggers one migration at a time, so the first (and only) item
# is the one to check.
phase="$(kubectl get vmim -o jsonpath='{.items[0].status.phase}' 2>/dev/null)"
if [ "$phase" = "Succeeded" ]; then
  say "migration succeeded"
else
  die "migration did not reach phase 'Succeeded' within the timeout (last observed phase: '${phase:-unknown}') — run 'kubectl get vmim -o wide' and 'kubectl describe vmim' to investigate"
fi

say "current VMI placement:"
kubectl get vmi -o wide
