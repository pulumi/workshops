#!/usr/bin/env bash
# Step 5: start a rotation now instead of waiting for the schedule, then show the version labels.
set -euo pipefail

cd "$(dirname "$0")/../02-rotating-secret"
secret_id=$(pulumi stack output secretName)
region=$(pulumi config get aws:region)

echo "--- before"
aws secretsmanager describe-secret --secret-id "$secret_id" --region "$region" \
  --query 'VersionIdsToStages' --output json

aws secretsmanager rotate-secret --secret-id "$secret_id" --region "$region" >/dev/null
echo "rotation started, waiting for the Lambda to finish"

for _ in $(seq 1 30); do
  sleep 4
  stages=$(aws secretsmanager describe-secret --secret-id "$secret_id" --region "$region" \
    --query 'VersionIdsToStages' --output json)
  if ! echo "$stages" | grep -q AWSPENDING && echo "$stages" | grep -q AWSPREVIOUS; then
    break
  fi
done

echo "--- after (expect AWSCURRENT and AWSPREVIOUS, no AWSPENDING)"
echo "$stages" | jq .
