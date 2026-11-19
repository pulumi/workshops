#!/usr/bin/env bash
# create.sh — create one mangodb object in the consumer and show it on the provider (demo step 7).
#
#   07-create-object/create.sh   # consumer-a-dev
#
# kubectl apply -f 07-create-object/mangodb.yaml on the consumer, then the same list
# on both clusters. The object appears on the provider in a namespace the backend
# created for this consumer. Syncing takes a few seconds; check.sh retries.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

need_org
say "step 7: create a mangodb object on $CONSUMER_A_STACK"
write_kubeconfig "$CONSUMER_A_STACK" >/dev/null
kc "$CONSUMER_A_STACK" kubectl apply -f "$WORKSHOP_DIR/07-create-object/mangodb.yaml"
exec "$(dirname "${BASH_SOURCE[0]}")/check.sh"
