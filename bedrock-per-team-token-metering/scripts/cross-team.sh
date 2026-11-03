#!/usr/bin/env bash
# The boundary: the support role calls the search team's profile. Expected: AccessDenied.
# Usage: scripts/cross-team.sh [caller=support] [target=search]
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need aws; need jq
caller="${1:-support}"
target="${2:-search}"
profile="$(team_profile_arn "$target")"
(
  assume_team "$caller"
  say "Calling as $caller, through the $target profile (this should fail)"
  if converse "$profile" "hello" 2>&1; then
    die "the call succeeded; the role is not scoped to its own profile"
  fi
  say "Denied, as intended: a role can only use its own team's profile"
)
