#!/usr/bin/env bash
# Step 10: remove everything the demo created. The secrets have a recovery window of 0, so they are gone at once.
# Usage: ./teardown.sh <pulumi-org>
set -euo pipefail

org=${1:?usage: teardown.sh <pulumi-org>}
here=$(cd "$(dirname "$0")" && pwd)
cd "$here/../02-rotating-secret"
user_name=$(pulumi stack output demoUserName 2>/dev/null || true)

# Keys the ESC rotator created are not in Pulumi state, so delete them before the user goes.
if [ -n "$user_name" ]; then
  for key in $(aws iam list-access-keys --user-name "$user_name" --query 'AccessKeyMetadata[].AccessKeyId' --output text); do
    aws iam delete-access-key --user-name "$user_name" --access-key-id "$key"
  done
fi

pulumi env rm --yes "$org/secret-rotation/app-secrets" || true
pulumi env rm --yes "$org/secret-rotation/iam-keys" || true
pulumi destroy --yes
pulumi stack rm --yes

echo "--- verify: both lists should be empty"
aws secretsmanager list-secrets --region us-east-1 --query "SecretList[?starts_with(Name, 'workshop/')].Name" --output text
aws iam list-users --query "Users[?contains(UserName, 'rotated-user')].UserName" --output text
