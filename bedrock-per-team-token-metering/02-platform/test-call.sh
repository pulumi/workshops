#!/usr/bin/env bash
# Step 2: one test call with the admin credentials, then read the record it left in the log group.
# The system-defined profile us.amazon.nova-2-lite-v1:0 is the model id here; no team profile exists yet.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need jq
model="$(pulumi_stack config get model 2>/dev/null || echo nova-2-lite)"
model_id="us.amazon.nova-2-lite-v1:0"; [ "$model" = nova-lite ] && model_id="amazon.nova-lite-v1:0"
say "Converse call through $model_id"
aws_admin bedrock-runtime converse --region "$REGION" --model-id "$model_id" \
  --messages '[{"role":"user","content":[{"text":"Say hello in five words."}]}]' \
  --query '{text: output.message.content[0].text, usage: usage}' --output json
say "Waiting for the invocation record (delivery takes up to a minute)"
sleep 45
aws_admin logs tail "$LOG_GROUP" --region "$REGION" --since 5m --format short | head -n 40
