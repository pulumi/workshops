#!/usr/bin/env bash
# Step 11: remove everything the workshop created, then prove it is gone.
# Usage: ./teardown.sh   (add DELETE_POLICY_PACK=1 to also delete a published pack, see below)
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws
say "pulumi destroy"
pulumi_stack destroy --yes
pulumi_stack stack rm --yes
if [ "${DELETE_POLICY_PACK:-0}" = 1 ]; then
  say "Removing the published policy pack"
  pulumi policy disable "$(org)/bedrock-metering-guardrails" || true
  pulumi policy rm "$(org)/bedrock-metering-guardrails" all --yes || true
fi
say "Verification (run before deleting the ESC environment)"
echo "inference profiles (APPLICATION):"
aws_admin bedrock list-inference-profiles --region "$REGION" --type-equals APPLICATION \
  --query 'inferenceProfileSummaries[].inferenceProfileName' --output text
echo "invocation logging configuration:"
aws_admin bedrock get-model-invocation-logging-configuration --region "$REGION"
echo "log groups:"
aws_admin logs describe-log-groups --region "$REGION" --log-group-name-prefix /workshop/ --query 'logGroups[].logGroupName' --output text
say "Removing the ESC environment"
pulumi env rm "$(esc_env)" --yes
