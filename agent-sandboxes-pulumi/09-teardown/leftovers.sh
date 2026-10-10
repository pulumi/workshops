#!/usr/bin/env bash
# Lists anything the demo may have left behind. Prints nothing under each heading when clean.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
source "$here/../lib.sh"

echo "buckets named agent-sandbox-*:"
aws s3api list-buckets --query "Buckets[?starts_with(Name, 'agent-sandbox-')].Name" --output text
echo "roles named agent-*:"
aws iam list-roles --query "Roles[?starts_with(RoleName, 'agent-')].RoleName" --output text
echo "customer-managed policies named agent-*:"
aws iam list-policies --scope Local --query "Policies[?starts_with(PolicyName, 'agent-')].PolicyName" --output text
