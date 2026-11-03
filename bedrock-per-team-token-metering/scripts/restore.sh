#!/usr/bin/env bash
# Lift a team's cutoff. A human decision, one command: remove the inline Deny the cutoff
# function attached, then prove the team can call again. Usage: scripts/restore.sh [team=search]
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need aws; need jq
team="${1:-search}"
role="bedrock-meter-$team"
profile="$(team_profile_arn "$team")"

say "Lifting the cutoff on $role"
echo "$ aws iam delete-role-policy --role-name $role --policy-name token-cutoff"
if aws_admin iam delete-role-policy --role-name "$role" --policy-name token-cutoff 2>/dev/null; then
  echo "removed"
else
  echo "no cutoff was in place on $role"
fi

(
  assume_team "$team"
  say "Calling as $team again"
  # IAM takes a few seconds to propagate the removal; retry briefly.
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if converse "$profile" "hello" --inference-config '{"maxTokens":20}' --query 'usage' --output json 2>/dev/null; then
      say "$team is back"
      exit 0
    fi
    [ "$attempt" -lt 10 ] || die "$team is still denied after $attempt attempts"
    printf 'still denied, waiting for IAM (attempt %s)\n' "$attempt"; sleep 3
  done
)
