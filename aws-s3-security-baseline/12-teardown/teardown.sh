#!/usr/bin/env bash
# Step 12: remove everything the demo created, in this order.
# Usage: ORG=acme ./teardown.sh
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../lib.sh"

cd "$here/../06-secure-bucket"
pulumi env run "$ESC_REF" -- pulumi destroy --yes
pulumi stack rm dev --yes

# Must print an empty list: the demo bucket is gone.
pulumi env run "$ESC_REF" -- aws s3api list-buckets --query "Buckets[].Name"

pulumi env rm "$ESC_REF" --yes

# Only if you ran step 11 (the pack must leave its policy group before it can be removed):
pulumi policy group remove "$POLICY_GROUP" --org "$ORG" --yes || true
pulumi policy rm "$ORG/s3-baseline-policies" all --yes || true
