#!/usr/bin/env bash
# Step 4: read the newest invocation records and show who called and how many tokens.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need jq
aws_admin logs tail "$LOG_GROUP" --region "$REGION" --since 15m --format short \
  | sed 's/^[^ ]* [^ ]* //' \
  | jq -c 'select(.identity != null) | {caller: .identity.arn, model: .modelId, input: .input.inputTokenCount, output: .output.outputTokenCount}' \
  | tail -n "${1:-10}"
