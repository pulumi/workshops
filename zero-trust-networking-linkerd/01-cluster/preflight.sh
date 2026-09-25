#!/usr/bin/env bash
# preflight.sh — presenter setup, run before the session (step 1, continued).
#
#   01-cluster/preflight.sh
#
# Confirms the cluster is reachable, runs `linkerd check --pre` (the CLI's
# own cluster-readiness check, no control plane installed yet), and
# pre-pulls the pinned control-plane and viz images so `pulumi up` in
# 03-control-plane and 05-mtls-proof do not spend live time downloading.
# Docker needs roughly 4 vCPU / 6 GB free for the cluster plus Linkerd's
# proxy sidecars and control-plane pods to schedule smoothly.
set -euo pipefail
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
CONTEXT="kind-$CLUSTER"

# Must match 03-control-plane/index.ts's LINKERD_CHART_VERSION and
# 05-mtls-proof/index.ts's LINKERD_CHART_VERSION.
LINKERD_CHART_VERSION="2026.6.3"

command -v kubectl >/dev/null 2>&1 || { echo "ERROR: kubectl not installed" >&2; exit 1; }

echo "checking cluster reachability ($CONTEXT)"
kubectl --context "$CONTEXT" get nodes || {
  echo "ERROR: cluster '$CLUSTER' not reachable; run 01-cluster/create-cluster.sh first" >&2
  exit 1
}

if command -v linkerd >/dev/null 2>&1; then
  echo
  echo "running 'linkerd check --pre' (no control plane installed yet)"
  linkerd check --pre --context "$CONTEXT"
else
  echo "linkerd CLI not installed; skipping 'linkerd check --pre'" >&2
  echo "install it: https://github.com/linkerd/linkerd2/releases/tag/edge-26.6.3" >&2
fi

echo
echo "pre-pulling control-plane and viz images onto the kind node (chart $LINKERD_CHART_VERSION)"
for image in \
  "cr.l5d.io/linkerd/controller:edge-26.6.3" \
  "cr.l5d.io/linkerd/proxy:edge-26.6.3" \
  "cr.l5d.io/linkerd/proxy-init:v2.7.0" \
  "cr.l5d.io/linkerd/metrics-api:edge-26.6.3" \
  "cr.l5d.io/linkerd/tap:edge-26.6.3"; do
  docker exec "${CLUSTER}-control-plane" crictl pull "$image" >/dev/null 2>&1 || \
    echo "  (pre-pull skipped for $image: crictl unavailable or image tag differs; pulumi up will pull it live instead)"
done

echo
echo "preflight OK: cluster reachable, ready for 02-trust-anchor"
