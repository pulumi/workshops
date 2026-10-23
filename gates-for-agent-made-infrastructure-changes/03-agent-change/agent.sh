#!/usr/bin/env bash
# Step 3: the scripted agent proposes a non-compliant change and previews it.
# Expected: pulumi preview exits non-zero and names the violated policies.
# If the org has no policy group for the stack, set POLICY_PACK_DIR to the pack
# folder (02-policy-pack) and the pack runs locally with --policy-pack.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_cmd pulumi
cd "$(folder_dir 01-baseline)" || exit 1
pulumi stack select "$STACK" || die "stack $STACK not found; run 01-baseline/setup.sh"

info "Agent: adding a second bucket with no tags, no public access block, no encryption"
pulumi config set agentChange noncompliant

args=(preview)
if [[ -n "${POLICY_PACK_DIR:-}" ]]; then
  args+=(--policy-pack "$POLICY_PACK_DIR")
fi

pulumi "${args[@]}"
code=$?
echo "pulumi preview exit code: $code"
if [[ $code -eq 0 ]]; then
  die "preview passed; the gate did not block the change"
fi
info "Blocked as expected. Nothing changed in AWS."
