#!/usr/bin/env bash
# preflight.sh — presenter setup, run before the session (step 1, continued).
#
#   01-cluster/preflight.sh
#
# Confirms the cluster is reachable and pre-pulls the Kyverno image layers so
# `pulumi up` in 02-kyverno does not spend live time downloading. Docker
# needs roughly 4 vCPU / 6 GB free for the cluster plus Kyverno's
# admission-webhook pods to schedule smoothly (see brief risk: resource
# limits too low).
set -euo pipefail
CLUSTER="${POLICY_DEMO_CLUSTER:-policy-demo}"
CONTEXT="kind-$CLUSTER"

command -v kubectl >/dev/null 2>&1 || { echo "ERROR: kubectl not installed" >&2; exit 1; }

echo "checking cluster reachability ($CONTEXT)"
kubectl --context "$CONTEXT" get nodes || {
  echo "ERROR: cluster '$CLUSTER' not reachable; run 01-cluster/create-cluster.sh first" >&2
  exit 1
}

echo
echo "pre-pulling the Kyverno controller image onto the kind node"
# Pin to the same chart version as 02-kyverno/index.ts (KYVERNO_CHART_VERSION there).
docker exec "${CLUSTER}-control-plane" crictl pull ghcr.io/kyverno/kyverno:v1.15.2 >/dev/null 2>&1 || \
  echo "  (pre-pull skipped: crictl not available on this node image; pulumi up will pull it live instead)"

echo
echo "preflight OK: cluster reachable, ready for 02-kyverno"
