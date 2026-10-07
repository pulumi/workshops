#!/usr/bin/env bash
# Step 5: add team "support". Same component, one more entry in the teams config.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need jq
set_teams '[{"name":"search","costCenter":"cc-1001"},{"name":"support","costCenter":"cc-2002"}]'
aws_admin bedrock list-inference-profiles --region "$REGION" --type-equals APPLICATION \
  --query 'inferenceProfileSummaries[].inferenceProfileName' --output text
