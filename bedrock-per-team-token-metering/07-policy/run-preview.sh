#!/usr/bin/env bash
# Step 7: the baseline stack passes the policy pack. Runs locally; no publish needed.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need npm
[ -d "$POLICY_DIR/node_modules" ] || (cd "$POLICY_DIR" && npm ci)
pulumi_stack preview --policy-pack ../07-policy
