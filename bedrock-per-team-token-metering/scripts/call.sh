#!/usr/bin/env bash
# Call the model as one team, through that team's inference profile.
# Usage: scripts/call.sh <team> [count=20]. Prompts vary in length so the token counts differ.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need aws; need jq
team="${1:?usage: send-calls.sh <team> [count]}"
count="${2:-20}"
profile="$(team_profile_arn "$team")"
if [ -z "$profile" ] || [ "$profile" = null ]; then die "no profile for team $team; add it to teams in Pulumi.dev.yaml and run pulumi up"; fi
words=(alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima)
(
  assume_team "$team"
  say "Calling as team $team through its own profile ($count calls)"
  echo "$ aws bedrock-runtime converse --model-id $profile \\"
  echo "    --messages '[{\"role\":\"user\",\"content\":[{\"text\":\"...\"}]}]' --inference-config '{\"maxTokens\":150}' --query usage"
  for i in $(seq 1 "$count"); do
    n=$(( (i % 10) * 12 + 5 ))
    prompt="Write one sentence about ${words[i % ${#words[@]}]} and then continue with about $n words on cloud cost."
    messages="$(jq -nc --arg t "$prompt" '[{role:"user",content:[{text:$t}]}]')"
    # A role policy written seconds ago can lag the role itself (IAM propagation); only
    # the first call retries, and only on "no identity-based policy allows". An explicit
    # deny (the cutoff) fails at once.
    attempt=1
    until out="$(aws bedrock-runtime converse --region "$REGION" --model-id "$profile" \
        --messages "$messages" --inference-config '{"maxTokens":150}' --query 'usage' --output json 2>&1)"; do
      if [ "$i" -eq 1 ] && [ "$attempt" -lt 10 ] && grep -q 'no identity-based policy allows' <<<"$out"; then
        printf 'waiting for the invoke policy to propagate (attempt %s)\n' "$attempt"; attempt=$((attempt + 1)); sleep 3
      else
        die "$out"
      fi
    done
    printf 'call %02d: %s\n' "$i" "$(jq -c . <<<"$out")"
  done
)
