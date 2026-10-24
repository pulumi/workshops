#!/usr/bin/env bash
# Step 1: create the ESC environment and the first stack.
# Usage: ORG=<your-org> ROLE_ARN=<oidc-role-arn> ./setup.sh
set -euo pipefail
: "${ORG:?set ORG to your Pulumi Cloud organization}"
: "${ROLE_ARN:?set ROLE_ARN to the IAM role ESC assumes through OIDC}"

cd "$(dirname "$0")"
sed "s|arn:aws:iam::123456789012:role/pulumi-esc-workshop|${ROLE_ARN}|" environment.yaml > /tmp/pki-aws-vault.yaml

pulumi env init "${ORG}/pki-workshop/aws-vault" || true
pulumi env edit --file /tmp/pki-aws-vault.yaml "${ORG}/pki-workshop/aws-vault"
rm -f /tmp/pki-aws-vault.yaml

(cd .. && npm install)
pulumi stack init "${ORG}/dev"
pulumi config env add pki-workshop/aws-vault --stack dev --yes

# End state checks: credentials resolve, config holds no plaintext secret.
pulumi env open "${ORG}/pki-workshop/aws-vault" --format json | jq '.environmentVariables | keys'
pulumi config
pulumi up --yes
