#!/usr/bin/env bash
# Step 8: the ESC aws-iam rotator rotates the access keys of the demo IAM user.
# Usage: ./rotate.sh <pulumi-org>
set -euo pipefail

org=${1:?usage: rotate.sh <pulumi-org>}
here=$(cd "$(dirname "$0")" && pwd)
role_arn=$(cd "$here/../02-rotating-secret" && pulumi stack output escRoleArn)
user_arn=$(cd "$here/../02-rotating-secret" && pulumi stack output demoUserArn)
user_name=$(cd "$here/../02-rotating-secret" && pulumi stack output demoUserName)

rendered=$(mktemp)
trap 'rm -f "$rendered"' EXIT
sed -e "s|__ESC_ROLE_ARN__|$role_arn|" -e "s|__USER_ARN__|$user_arn|" \
  "$here/iam-keys.yaml" > "$rendered"

pulumi env init "$org/secret-rotation/iam-keys" || true
pulumi env edit --file "$rendered" "$org/secret-rotation/iam-keys"

pulumi env rotate "$org/secret-rotation/iam-keys"
echo "--- access keys on $user_name (the rotator keeps current and previous)"
aws iam list-access-keys --user-name "$user_name" --query 'AccessKeyMetadata[].[AccessKeyId,CreateDate]' --output text
