#!/usr/bin/env bash
# teardown.sh — step 8: leave nothing behind.
#
#   08-teardown/teardown.sh
#
# Destroys every Pulumi stack created by this workshop in reverse
# dependency order (06 depends on 04's ServiceAccounts existing; 05 depends
# on 03's control plane; 03 depends on 02's trust anchor outputs), then
# deletes the throwaway kubectl objects from step 7, then the kind cluster
# itself. Expected end state (brief step 8): `kind get clusters` no longer
# lists the demo cluster, and `pulumi stack ls` in each folder shows no
# resources.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"

export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-}"

destroy_stack() {
  local dir="$1"
  echo
  echo "=== pulumi destroy: $dir ==="
  if [ -d "$ROOT/$dir" ]; then
    (cd "$ROOT/$dir" && pulumi destroy --yes --non-interactive) || \
      echo "  (destroy for $dir failed or had nothing to destroy; continuing)"
  else
    echo "  (folder $dir not found; skipping)"
  fi
}

echo "removing step 7's throwaway test client, if it is still around..."
kubectl --context "kind-$CLUSTER" delete -f "$ROOT/07-deny-in-action/unauthorized-client.yaml" \
  --ignore-not-found 2>/dev/null || true

# Reverse of the build order: 06, 05, 04, 03, 02.
destroy_stack "06-authorization-policy"
destroy_stack "05-mtls-proof"
destroy_stack "04-meshed-services"
destroy_stack "03-control-plane"
destroy_stack "02-trust-anchor"

echo
echo "deleting the kind cluster '$CLUSTER'..."
if kind get clusters 2>/dev/null | grep -qx "$CLUSTER"; then
  kind delete cluster --name "$CLUSTER"
else
  echo "  (no kind cluster named '$CLUSTER' found; nothing to delete)"
fi

echo
echo "teardown complete."
