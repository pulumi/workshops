#!/usr/bin/env bash
# Presenter-once setup: IAM OIDC identity provider and role for the ESC environment.
# Follows https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/
# (identity provider URL https://api.pulumi.com/oidc, audience aws:<org>, trust
# policy sub "pulumi:environments:org:<org>:env:*").
# Not run while this folder was built: the AWS CLI was not installed there.
# Alternative that does the same without this script: `pulumi env setup aws`
# (CLI v3.261.0 or later, see the same docs page).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../../lib.sh"

require_cmd aws jq
require_org

ROLE_NAME="${ROLE_NAME:-agent-gates-esc}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/api.pulumi.com/oidc"

echo "Account $ACCOUNT_ID: creating OIDC provider and role $ROLE_NAME for Pulumi org $ORG"
confirm "Continue?" || die "aborted"

if ! aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$PROVIDER_ARN" >/dev/null 2>&1; then
  aws iam create-open-id-connect-provider \
    --url https://api.pulumi.com/oidc \
    --client-id-list "aws:$ORG"
fi

trust="$(jq -n --arg arn "$PROVIDER_ARN" --arg org "$ORG" '{
  Version: "2012-10-17",
  Statement: [{
    Effect: "Allow",
    Principal: {Federated: $arn},
    Action: "sts:AssumeRoleWithWebIdentity",
    Condition: {
      StringEquals: {"api.pulumi.com/oidc:aud": ("aws:" + $org)},
      StringLike: {"api.pulumi.com/oidc:sub": ("pulumi:environments:org:" + $org + ":env:*")}
    }
  }]
}')"

aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$trust" >/dev/null
# S3 only: the demo creates buckets and nothing else.
aws iam attach-role-policy --role-name "$ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

echo "ROLE_ARN=arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
