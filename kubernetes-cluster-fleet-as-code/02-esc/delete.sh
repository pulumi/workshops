#!/usr/bin/env bash
# delete.sh - part of step 9: remove the four ESC environments, after the stacks are gone.
# The per-cluster environments go first, because they import fleet/azure-base.
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_org

for entry in "${CLUSTER_ENVS[@]}"; do
  name="${entry%%:*}"
  say "removing fleet/$name"
  pulumi env rm "$PULUMI_ORG/fleet/$name" --yes
done
say "removing fleet/azure-base"
pulumi env rm "$PULUMI_ORG/fleet/azure-base" --yes

say "left over in project fleet (should list nothing)"
pulumi env ls --organization "$PULUMI_ORG" --project fleet
