#!/usr/bin/env bash
# Create the ESC environment <org>/tf-modules-gitops/aws-oidc from aws-oidc.env.yaml.
# Usage: ./create-env.sh <pulumi-org> <role-arn>
# The role ARN comes from `pulumi env setup aws` or from the console steps in the README.
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <pulumi-org> <role-arn>" >&2
  exit 2
fi
org="$1"
role_arn="$2"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

sed "s|ROLE_ARN_PLACEHOLDER|${role_arn}|" "${here}/aws-oidc.env.yaml" |
  pulumi env init "${org}/tf-modules-gitops/aws-oidc" --file -

echo "Created ${org}/tf-modules-gitops/aws-oidc."
echo "Check the credentials resolve without printing them:"
echo "  pulumi env run ${org}/tf-modules-gitops/aws-oidc -- aws sts get-caller-identity"
