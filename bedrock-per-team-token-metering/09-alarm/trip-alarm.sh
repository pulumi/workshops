#!/usr/bin/env bash
# Step 9: long outputs from one team push its output tokens over the alarm threshold.
# Usage: ./trip-alarm.sh [team=search]. Alarm state changes within a few minutes.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need jq
team="${1:-search}"
profile="$(team_profile_arn "$team")"
(
  assume_team "$team"
  say "Asking $team's profile for long answers"
  for _ in 1 2 3 4 5 6 7 8; do
    aws bedrock-runtime converse --region "$REGION" --model-id "$profile" \
      --messages '[{"role":"user","content":[{"text":"Write a detailed 600 word essay on FinOps for generative AI."}]}]' \
      --inference-config '{"maxTokens":1000}' --query 'usage.outputTokens' --output text
  done
)
say "Alarm state (re-run until it reads ALARM)"
aws_admin cloudwatch describe-alarms --region "$REGION" --alarm-names "bedrock-$team-output-tokens" \
  --query 'MetricAlarms[].{alarm:AlarmName,state:StateValue}' --output table
