#!/usr/bin/env bash
# Step 3: add team "search": one inference profile, one role, two metric filters, one alarm.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need jq
set_teams '[{"name":"search","costCenter":"cc-1001"}]'
say "Application inference profiles in the account"
aws_admin bedrock list-inference-profiles --region "$REGION" --type-equals APPLICATION \
  --query 'inferenceProfileSummaries[].{name:inferenceProfileName,arn:inferenceProfileArn,status:status}' --output table
