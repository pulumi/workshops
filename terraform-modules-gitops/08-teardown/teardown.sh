#!/usr/bin/env bash
# Remove everything the workshop created in AWS and in the stack, then check.
# Run it from the project directory. `pulumi destroy` asks for confirmation.
# The Deployments settings, the ESC environment, the IAM role and the
# identity provider are removed by hand; see the README, "Teardown".
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../07-drift/lib.sh
source "${here}/../07-drift/lib.sh"

stack="$(pulumi stack --show-name)"
project="tf-modules-gitops"

pulumi destroy
pulumi stack rm "${stack}"

echo
echo "Checking ${REGION} for anything left (each list should be empty):"
echo "VPCs tagged Project=${project}:"
aws_cmd ec2 describe-vpcs --region "${REGION}" \
  --filters "Name=tag:Project,Values=${project}" --query 'Vpcs[].VpcId' --output text
echo "Security groups tagged Project=${project}:"
aws_cmd ec2 describe-security-groups --region "${REGION}" \
  --filters "Name=tag:Project,Values=${project}" --query 'SecurityGroups[].GroupId' --output text
echo "SSM parameters under /${project}/:"
aws_cmd ssm get-parameters-by-path --region "${REGION}" --path "/${project}/" \
  --recursive --query 'Parameters[].Name' --output text
