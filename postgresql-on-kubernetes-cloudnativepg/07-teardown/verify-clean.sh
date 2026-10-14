#!/usr/bin/env bash
set -euo pipefail

# Checks for any PVCs left behind after teardown.sh has run, labeled with
# cnpg.io/cluster (CNPG stamps this label on every PVC it creates).
#
# On a REAL (non-kind) cluster: every CNPG-managed PVC carries a Kubernetes
# OwnerReference pointing at its Cluster custom resource, so deleting the
# Cluster normally cascades into Kubernetes' own garbage collector deleting
# the PVCs automatically -- no CNPG-specific step is required in the ordinary
# case. This check exists as a belt-and-suspenders safety net for the edge
# cases (a stuck finalizer, a storage-class reclaim-policy quirk, or garbage
# collection disabled in that cluster) where an orphan can still survive. If
# this script reports leftovers on a real cluster, the documented manual
# fallback is:
#   kubectl delete pvc -l cnpg.io/cluster=<name> -n <namespace>
#
# On THIS workshop's kind cluster specifically, this check is somewhat moot:
# 01-platform's teardown runs `kind delete cluster`, which destroys the whole
# node's containerd storage (and therefore every PVC) regardless of owner
# references. Leftovers should only appear here if 01-platform's destroy was
# skipped or failed partway through.

say() { printf '>>> %s\n' "$*"; }

command -v kubectl >/dev/null 2>&1 || { printf 'ERROR: kubectl not found on PATH\n' >&2; exit 1; }

say "Checking for leftover cnpg.io/cluster-labeled PVCs across all namespaces..."
leftovers="$(kubectl get pvc -A -l cnpg.io/cluster -o custom-columns='NAMESPACE:.metadata.namespace,NAME:.metadata.name,CLUSTER:.metadata.labels.cnpg\.io/cluster' --no-headers 2>/dev/null || true)"

if [[ -z "${leftovers}" ]]; then
  say "Clean: no cnpg.io/cluster-labeled PVCs found."
  exit 0
fi

printf 'Found leftover PVCs:\n%s\n' "${leftovers}" >&2
say "On a real cluster, remove them per-cluster with:"
say "  kubectl delete pvc -l cnpg.io/cluster=<name> -n <namespace>"
exit 1
