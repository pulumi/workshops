#!/usr/bin/env bash
# Step 8: add the two mistakes (an untagged profile, a wildcard invoke policy) and preview with the policy pack.
# The preview fails with two mandatory violations; nothing reaches AWS.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need npm
[ -d "$POLICY_DIR/node_modules" ] || (cd "$POLICY_DIR" && npm ci)
pulumi_stack config set demoViolations true
say "pulumi preview --policy-pack ../07-policy (expected to fail)"
if pulumi_stack preview --policy-pack ../07-policy; then
  die "the preview passed; the policy pack did not catch the violations"
fi
say "Blocked by policy, as intended"
