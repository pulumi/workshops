#!/usr/bin/env bash
# teardown.sh — destroy the stacks in reverse order, delete the kind cluster, then prove nothing is left.
#   05-teardown/teardown.sh
set -uo pipefail
# shellcheck source=../lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
have pulumi || die "pulumi not installed"

for d in 03-jobs 02-queues 01-cluster; do
  say "pulumi destroy in $d"
  pulumi destroy --yes --stack "$STACK" --cwd "$WORKSHOP_DIR/$d" || die "destroy failed in $d"
done

if have kind && kind get clusters 2>/dev/null | grep -qx "$KIND_NAME"; then
  say "kind delete cluster --name $KIND_NAME"
  kind delete cluster --name "$KIND_NAME"
fi

say "what is left"
if have kind; then echo "kind clusters: $(kind get clusters 2>&1 | tr '\n' ' ')"; fi
if have docker; then docker ps --filter "name=$KIND_NAME" --format '{{.Names}}'; fi
say "teardown finished"
