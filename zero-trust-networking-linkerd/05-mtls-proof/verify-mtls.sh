#!/usr/bin/env bash
# verify-mtls.sh — step 5, live: prove the front-to-backend call in
# mesh-demo is mutually TLS'd without either service having been configured
# for it.
#
#   05-mtls-proof/verify-mtls.sh
#
# Expected end state (brief step 5): `linkerd viz edges` shows the
# front -> backend connection with SECURED = true and both identities in the
# mesh-demo.serviceaccount.identity.linkerd.cluster.local domain. Primary
# check is `edges` (an aggregate snapshot); `tap` is a live-request fallback
# if a presenter wants to show individual requests instead (brief risk:
# "linkerd viz tap produces no visible output if run before any request
# lands" — edges does not have that failure mode, so it runs first).
set -uo pipefail
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
CONTEXT="kind-$CLUSTER"

echo "generating one request from front to backend..."
kubectl --context "$CONTEXT" exec -n mesh-demo deploy/front -c echo -- \
  wget -q -O - http://backend:80/ >/dev/null 2>&1 || \
  echo "  (request may have failed; edges below still reflects any earlier traffic)"

echo
echo "=== linkerd viz edges (aggregate view) ==="
linkerd viz --context "$CONTEXT" -n mesh-demo edges deployment

echo
echo "if the SECURED column above does not show a checkmark for the"
echo "front -> backend edge, fall back to a live tap for detail:"
echo "  linkerd viz --context $CONTEXT -n mesh-demo tap deploy/backend"
