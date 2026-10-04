#!/usr/bin/env bash
# teardown.sh — step 7: destroy the stacks in reverse order, delete the kind cluster, then prove nothing is left.
#   06-teardown/teardown.sh
set -uo pipefail
# shellcheck source=../04-clients/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../04-clients/lib.sh"
have pulumi || die "pulumi not installed"
KIND_NAME="${KIND_NAME:-kafka-workshop}"

if [ -f "$KUBECONFIG" ]; then
  for d in 03-topic 02-kafka 01-cluster; do
    say "pulumi destroy in $d"
    pulumi destroy --yes --stack "$STACK" --cwd "$WORKSHOP_DIR/$d" || die "destroy failed in $d"
  done
  # The node pools set deleteClaim: true, so PVCs should already be gone. Report, then clean up if not.
  say "PVCs left behind (expect none)"
  kubectl -n "$NS" get pvc 2>&1 || true
  kubectl -n "$NS" delete pvc --all --ignore-not-found 2>&1 || true
fi

if have kind && kind get clusters 2>/dev/null | grep -qx "$KIND_NAME"; then
  say "kind delete cluster --name $KIND_NAME"
  kind delete cluster --name "$KIND_NAME"
fi

say "what is left"
if have kind; then echo "kind clusters: $(kind get clusters 2>&1 | tr '\n' ' ')"; fi
if have docker; then docker ps --filter "name=$KIND_NAME" --format '{{.Names}}'; fi
say "teardown finished"
