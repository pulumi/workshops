#!/usr/bin/env bash
# check.sh — proof for step 8: two consumers on the provider, provider stack unchanged.
#
#   08-second-consumer/check.sh
#
# Read-only. The provider lists mangodb objects from two consumers in separate
# namespaces, and `pulumi preview --expect-no-changes` on provider-dev exits 0.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -uo pipefail

need_org
say "provider: objects from both consumers"
write_kubeconfig "$PROVIDER_STACK" >/dev/null
for _ in $(seq 1 6); do
  out="$(kc "$PROVIDER_STACK" kubectl get mangodbs.mangodb.com -A 2>&1)"
  echo "$out" | grep -q demo-from-consumer-b && break
  sleep 10
done
echo "$out"
say "provider stack unchanged"
cd "$PROVIDER_DIR" || exit 1
run pulumi preview --expect-no-changes --stack "$ORG/$PROVIDER_STACK"
echo "exit=$?  (0: the provider stack was not changed by adding a consumer)"
