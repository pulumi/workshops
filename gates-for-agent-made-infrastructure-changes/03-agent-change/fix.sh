#!/usr/bin/env bash
# fix.sh: the agent's second attempt. The change now carries the owner and
# change-ref tags, a public access block and server-side encryption, so the
# policy pack passes. Run it after agent.sh was blocked.
set -uo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_cmd pulumi
cd "$(folder_dir 01-baseline)" || exit 1
pulumi stack select "$STACK" || die "stack $STACK not found; run 01-baseline/setup.sh"

info "Agent: fixing the second bucket (tags, public access block, encryption)"
pulumi config set agentChange fixed
args=(preview)
if [[ -n "${POLICY_PACK_DIR:-}" ]]; then
  args+=(--policy-pack "$POLICY_PACK_DIR")
fi
pulumi "${args[@]}"
code=$?
echo "pulumi preview exit code: $code"
[[ $code -eq 0 ]] || die "the fixed change still fails the gate"
info "The fixed change passes the policies. Applying it needs ESC access: continue with step 4."
