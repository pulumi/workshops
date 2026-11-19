#!/usr/bin/env bash
# Restore the baseline: agentChange=none and the baseline stack contents.
# Does not delete anything outside the stack. Teardown is a separate, ordered step.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_cmd pulumi
cd "$(folder_dir 01-baseline)"
pulumi stack select "$STACK"
pulumi config set agentChange none
pulumi preview
if confirm "Run pulumi up to restore the baseline (removes the agent bucket)?"; then
  pulumi up
fi
