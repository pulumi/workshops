#!/usr/bin/env bash
# cleanup.sh — delete the ESC environments and the local kubeconfigs (demo step 9).
#
#   09-teardown/cleanup.sh   # run after teardown.sh and verify.sh
#
# Removes the three ESC environments and .state/ (kubeconfigs and the kubectl-bind
# binary). Asks before each environment; KBIND_DEMO_YES=1 skips the prompts.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -uo pipefail

need_org
for stack in "$CONSUMER_B_STACK" "$CONSUMER_A_STACK" "$PROVIDER_STACK"; do
  if pulumi env get "$(esc_env "$stack")" >/dev/null 2>&1; then
    run pulumi env rm "$(esc_env "$stack")" ${YES_FLAG[@]+"${YES_FLAG[@]}"}
  else
    note "environment $(esc_env "$stack") does not exist, skipping"
  fi
done
say "local files"
run rm -rf "$STATE_DIR" "$PROVIDER_DIR/.state"
