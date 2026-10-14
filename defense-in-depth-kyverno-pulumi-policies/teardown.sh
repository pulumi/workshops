#!/usr/bin/env bash
# teardown.sh — step 8: leave nothing running or billing.
#
#   ./teardown.sh
#
# Destroys the three Pulumi stacks in reverse dependency order, then deletes
# the kind cluster. End state (brief step 8): `docker ps` shows no
# policy-demo containers, and kubectl can no longer reach the cluster.
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER="${POLICY_DEMO_CLUSTER:-policy-demo}"

destroy_stack() {
  local project_dir="$1"
  if [ -d "$project_dir" ]; then
    echo "destroying stack in $project_dir"
    (cd "$project_dir" && pulumi destroy --yes) || \
      echo "  WARNING: pulumi destroy failed in $project_dir; check manually" >&2
  fi
}

# Reverse of the build order: workload and its policy pack have no
# Pulumi-managed state of their own beyond the workload stack itself, the
# ClusterPolicy, then Kyverno.
destroy_stack "$DIR/05-pipeline-policy/workload"
destroy_stack "$DIR/03-cluster-policy"
destroy_stack "$DIR/02-kyverno"

if command -v kind >/dev/null 2>&1; then
  echo "deleting kind cluster '$CLUSTER'"
  kind delete cluster --name "$CLUSTER"
else
  echo "kind not installed; cannot delete cluster '$CLUSTER' automatically" >&2
fi

echo
echo "verify: 'docker ps' should show no ${CLUSTER}-control-plane container,"
echo "and 'kubectl config get-contexts' should no longer list kind-$CLUSTER."
