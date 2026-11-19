#!/usr/bin/env bash
# Step 7: destroy every stack in reverse dependency order, then confirm
# nothing was left behind. Run from the workshop root:
#   06-teardown/teardown.sh
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

say "Destroying stacks in reverse order (autoscaling -> quotas -> device-plugin -> cluster)"

for project in 04-autoscaling 03-quotas 02-device-plugin 01-cluster; do
  say "pulumi destroy in ${project}"
  (cd "${WORKSHOP_DIR}/${project}" && pulumi destroy --stack dev --yes)
done

say "All stacks destroyed. Run 06-teardown/verify-clean.sh to confirm no orphaned AWS resources remain."
