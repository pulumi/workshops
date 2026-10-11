#!/usr/bin/env bash
# Step 6: create the ESC environment that reads the secret's current and previous version.
# Usage: ./create-env.sh <pulumi-org>
set -euo pipefail

org=${1:?usage: create-env.sh <pulumi-org>}
here=$(cd "$(dirname "$0")" && pwd)
role_arn=$(cd "$here/../02-rotating-secret" && pulumi stack output escRoleArn)
secret_arn=$(cd "$here/../02-rotating-secret" && pulumi stack output secretArn)

rendered=$(mktemp)
trap 'rm -f "$rendered"' EXIT
sed -e "s|__ESC_ROLE_ARN__|$role_arn|" -e "s|__SECRET_ARN__|$secret_arn|" \
  "$here/app-secrets.yaml" > "$rendered"

pulumi env init "$org/secret-rotation/app-secrets" || true
pulumi env edit --file "$rendered" "$org/secret-rotation/app-secrets"

echo "--- opened: expect two token values (shown as [secret]) and the env var names"
pulumi env get "$org/secret-rotation/app-secrets"
