#!/usr/bin/env bash
set -euo pipefail
# Creates the ESC environment and the stack. Run once, from this folder.
# Needs: PULUMI_ORG (your Pulumi Cloud organization) and AWS_ROLE_ARN (the IAM role Pulumi ESC assumes).
: "${PULUMI_ORG:?set PULUMI_ORG}"
: "${AWS_ROLE_ARN:?set AWS_ROLE_ARN}"

cd "$(dirname "$0")"
sed "s|__AWS_ROLE_ARN__|${AWS_ROLE_ARN}|" esc/aws-oidc.yaml > /tmp/chaos-fis-aws-oidc.yaml

pulumi env init "${PULUMI_ORG}/chaos-fis/aws-oidc" --file /tmp/chaos-fis-aws-oidc.yaml
pulumi stack init "${PULUMI_ORG}/dev"
pulumi whoami -v
