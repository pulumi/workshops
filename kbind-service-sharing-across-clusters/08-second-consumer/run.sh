#!/usr/bin/env bash
# run.sh — add a second consumer without changing the provider (demo step 8).
#
#   08-second-consumer/run.sh   # consumer-b-dev: stack, ESC environment, cluster, bind, object
#
# Repeats steps 1, 5, 6 and 7 for consumer-b-dev. The binding opens a browser, as in
# step 6. Ends with the provider listing objects from two consumers and a preview that
# shows the provider stack has no pending changes.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

need_org
here="$(dirname "${BASH_SOURCE[0]}")"
"$here/../01-stacks-and-esc/setup.sh" "$CONSUMER_B_STACK"
"$here/../05-consumer/deploy.sh" "$CONSUMER_B_STACK"
"$here/../05-consumer/check.sh" "$CONSUMER_B_STACK"
"$here/../06-bind/bind.sh" "$CONSUMER_B_STACK"
"$here/../06-bind/check.sh" "$CONSUMER_B_STACK"

say "step 8: create a mangodb object on $CONSUMER_B_STACK"
write_kubeconfig "$CONSUMER_B_STACK" >/dev/null
kc "$CONSUMER_B_STACK" kubectl apply -f "$WORKSHOP_DIR/08-second-consumer/mangodb.yaml"
exec "$here/check.sh"
