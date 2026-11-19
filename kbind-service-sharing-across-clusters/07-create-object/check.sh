#!/usr/bin/env bash
# check.sh — proof that the object exists on the consumer and on the provider (demo step 7).
#
#   07-create-object/check.sh
#
# Read-only. Retries the provider list for up to 60 seconds while the konnector syncs.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -uo pipefail

need_org
say "consumer: $CONSUMER_A_STACK"
kc "$CONSUMER_A_STACK" kubectl get mangodbs.mangodb.com -A; echo "exit=$?  (non-zero: API not bound)"
say "provider: $PROVIDER_STACK"
write_kubeconfig "$PROVIDER_STACK" >/dev/null
for _ in $(seq 1 6); do
  out="$(kc "$PROVIDER_STACK" kubectl get mangodbs.mangodb.com -A 2>&1)"
  echo "$out" | grep -q demo-from-consumer-a && break
  sleep 10
done
echo "$out"
echo "$out" | grep -q demo-from-consumer-a && echo "synced: yes" || echo "synced: no (the provider does not list the object yet)"
