#!/usr/bin/env bash
# Steps 4 and 5: call the model as one team, through that team's inference profile.
# Usage: ./send-calls.sh <team> [count=20]. Prompts vary in length so the token counts differ.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need jq
team="${1:?usage: send-calls.sh <team> [count]}"
count="${2:-20}"
profile="$(team_profile_arn "$team")"
if [ -z "$profile" ] || [ "$profile" = null ]; then die "no profile for team $team; run the team step first"; fi
words=(alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima)
(
  assume_team "$team"
  say "Calling $profile as team $team ($count calls)"
  for i in $(seq 1 "$count"); do
    n=$(( (i % 10) * 12 + 5 ))
    prompt="Write one sentence about ${words[i % ${#words[@]}]} and then continue with about $n words on cloud cost."
    out="$(aws bedrock-runtime converse --region "$REGION" --model-id "$profile" \
      --messages "$(jq -nc --arg t "$prompt" '[{role:"user",content:[{text:$t}]}]')" \
      --inference-config '{"maxTokens":300}' --query 'usage' --output json)"
    printf 'call %02d: %s\n' "$i" "$(jq -c . <<<"$out")"
  done
)
