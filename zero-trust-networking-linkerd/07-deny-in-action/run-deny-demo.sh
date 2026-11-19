#!/usr/bin/env bash
# run-deny-demo.sh — step 7, live: the payoff. Prove the traffic policy
# from step 6 is enforced, not just declared.
#
#   07-deny-in-action/run-deny-demo.sh
#
# Expected end state (brief step 7): an identity that is not "front" gets a
# real HTTP 403 from the mesh proxy calling backend directly, while "front"
# still gets 200 — the same call verify-policy.sh made in step 6, repeated
# here for contrast. Source for the 403 behavior:
# https://linkerd.io/docs/features/server-policy/#policy-rejections
# (read 2026-09-25): "Any traffic that is known to be HTTP ... that is
# denied by policy will result in the proxy returning an HTTP 403."
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
CONTEXT="kind-$CLUSTER"

echo "creating an unauthorized test client (ServiceAccount: curl-client)..."
kubectl --context "$CONTEXT" apply -f "$DIR/unauthorized-client.yaml"
kubectl --context "$CONTEXT" wait --for=condition=Ready pod/curl-client \
  -n mesh-demo --timeout=120s

echo
echo "=== unauthorized: curl-client -> backend (expect HTTP 403) ==="
kubectl --context "$CONTEXT" exec -n mesh-demo curl-client -c curl -- \
  curl -s -o /dev/null -w "HTTP status: %{http_code}\n" http://backend:80/

echo
echo "=== authorized: front -> backend (expect HTTP 200) ==="
kubectl --context "$CONTEXT" exec -n mesh-demo deploy/front -c echo -- \
  wget -q -O /dev/null --server-response http://backend:80/ 2>&1 \
  | grep "HTTP/" | head -1
