#!/usr/bin/env bash
# wait-for-control-plane.sh — run before `pulumi up` in this folder.
#
#   05-mtls-proof/wait-for-control-plane.sh && pulumi up
#
# linkerd-viz's own pods need the control plane's identity service to be
# Running before they can start; 03-control-plane's `pulumi up` returns as
# soon as the Kubernetes API accepts the Deployments, not once they are
# actually Ready. This is the same ordering gap `wait-for-kyverno.sh` covers
# in the defense-in-depth workshop, applied here to linkerd-identity.
set -euo pipefail
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
CONTEXT="kind-$CLUSTER"

echo "waiting for the Linkerd control plane's pods to be Ready..."
kubectl --context "$CONTEXT" wait --for=condition=Ready pods \
  --all -n linkerd --timeout=180s

echo "control plane is ready; safe to run 'pulumi up' in 05-mtls-proof"
