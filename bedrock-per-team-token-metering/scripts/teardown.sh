#!/usr/bin/env bash
# Remove everything the workshop created, then prove it is gone.
# Usage: scripts/teardown.sh   (DELETE_POLICY_PACK=1 also deletes a published pack)
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need aws
say "pulumi destroy"
pulumi_stack destroy --yes
# Drop the flags the tutorial may have set so the next run starts clean (the teams stay:
# they are part of the committed config), then remove the stack but keep Pulumi.dev.yaml.
for key in demoViolations enableBudget budgetEmail; do
  pulumi_stack config rm "$key" 2>/dev/null || true
done
pulumi_stack stack rm --yes --preserve-config
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
aws_admin logs describe-log-groups --region "$REGION" --log-group-name-prefix /aws/lambda/bedrock-token-cutoff --query 'logGroups[].logGroupName' --output text
echo "cutoff function:"
aws_admin lambda get-function --region "$REGION" --function-name bedrock-token-cutoff \
  --query 'Configuration.FunctionName' --output text 2>/dev/null || echo "(gone)"
say "Removing the ESC environment"
pulumi env rm "$(esc_env)" --yes
