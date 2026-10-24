#!/usr/bin/env bash
# teardown.sh — destroy everything in the right order (demo step 9).
#
#   09-teardown/teardown.sh   # destroy and remove consumer-b-dev, consumer-a-dev, provider-dev
#
# Consumers first, so the provider's load balancer and bindings have no live
# consumers. Then pulumi stack rm for each. A stack that does not exist is skipped.
# Asks before each destroy; KBIND_DEMO_YES=1 skips the prompts. Afterwards run
# 09-teardown/verify.sh and 09-teardown/cleanup.sh.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

need_org
say "step 9: tear down"
for stack in "$CONSUMER_B_STACK" "$CONSUMER_A_STACK" "$PROVIDER_STACK"; do
  dir="$(stack_dir "$stack")"
  if ! pulumi stack ls --cwd "$dir" 2>/dev/null | awk 'NR>1 {print $1}' | tr -d '*' | grep -qx "$stack"; then
    note "stack $stack does not exist, skipping"
    continue
  fi
  say "$stack"
  run pulumi destroy --stack "$ORG/$stack" --cwd "$dir" ${YES_FLAG[@]+"${YES_FLAG[@]}"}
  run pulumi stack rm "$ORG/$stack" --cwd "$dir" ${YES_FLAG[@]+"${YES_FLAG[@]}"}
done
