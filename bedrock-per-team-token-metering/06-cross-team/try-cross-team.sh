#!/usr/bin/env bash
# Step 6: the support role calls the search team's profile. Expected: AccessDenied.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need jq
profile="$(team_profile_arn search)"
(
  assume_team support
  say "Calling the search profile as support (this should fail)"
  if aws bedrock-runtime converse --region "$REGION" --model-id "$profile" \
       --messages '[{"role":"user","content":[{"text":"hello"}]}]' 2>&1; then
    die "the call succeeded; the role is not scoped to its own profile"
  fi
  say "Denied, as intended"
)
