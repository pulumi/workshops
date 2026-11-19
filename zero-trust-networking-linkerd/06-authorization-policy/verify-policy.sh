#!/usr/bin/env bash
# verify-policy.sh — step 6, live: confirm the CRDs applied and the
# front -> backend call still succeeds (it is the one identity the
# AuthorizationPolicy allows).
#
#   06-authorization-policy/verify-policy.sh
#
# Expected end state (brief step 6): `kubectl get server,authorizationpolicy,
# meshtlsauthentication -n mesh-demo` shows all three objects, and a request
# from front to backend still returns 200 because front is the authorized
# identity.
set -euo pipefail
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
CONTEXT="kind-$CLUSTER"

echo "=== policy objects in mesh-demo ==="
kubectl --context "$CONTEXT" -n mesh-demo get server,authorizationpolicy,meshtlsauthentication

echo
echo "=== front -> backend (authorized; expect success) ==="
kubectl --context "$CONTEXT" exec -n mesh-demo deploy/front -c echo -- \
  wget -q -O - --timeout=5 http://backend:80/ | head -c 200
echo
