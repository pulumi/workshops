#!/usr/bin/env bash
# Long outputs from one team push its output tokens over the alarm threshold in one minute.
# Usage: scripts/trip-alarm.sh [team=search]. The alarm flips to ALARM within about 90 seconds
# of the last call and the cutoff function denies the team role; see scripts/check-cutoff.sh.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need aws; need jq
team="${1:-search}"
profile="$(team_profile_arn "$team")"
threshold="$(team_limit "$team" perMinute)"
calls=8; max_tokens=1000
say "Burst limit for $team: $threshold output tokens in one minute (daily cap $(team_limit "$team" perDay)). Sending $calls calls of up to $max_tokens tokens each."
(
  assume_team "$team"
  echo "$ aws bedrock-runtime converse --model-id $profile \\"
  echo "    --messages '[{\"role\":\"user\",\"content\":[{\"text\":\"Write a detailed 600 word essay on FinOps for generative AI.\"}]}]' \\"
  echo "    --inference-config '{\"maxTokens\":$max_tokens}' --query usage.outputTokens      (x$calls)"
  total=0
  for _ in $(seq 1 "$calls"); do
    n="$(aws bedrock-runtime converse --region "$REGION" --model-id "$profile" \
      --messages '[{"role":"user","content":[{"text":"Write a detailed 600 word essay on FinOps for generative AI."}]}]' \
      --inference-config "{\"maxTokens\":$max_tokens}" --query 'usage.outputTokens' --output text)"
    total=$((total + n)); printf 'output tokens: %s (running total %s)\n' "$n" "$total"
  done
)
say "Alarm state now (it flips to ALARM within about 90 seconds; then run scripts/check-cutoff.sh $team)"
aws_admin cloudwatch describe-alarms --region "$REGION" --alarm-names "bedrock-$team-output-tokens" \
  --query 'MetricAlarms[].{alarm:AlarmName,state:StateValue}' --output table
