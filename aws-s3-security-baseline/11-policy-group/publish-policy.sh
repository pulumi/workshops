#!/usr/bin/env bash
# Step 11 (optional, presenter only): publish the pack and enforce it for the demo stack
# through its own policy group. Never touches default-policy-group.
# Usage: ORG=acme ./publish-policy.sh
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../lib.sh"

cd "$here/../05-policy-pack/policy"
npm install
pulumi policy publish "$ORG"

pulumi policy group new "$POLICY_GROUP" --org "$ORG" --entity-type stacks --mode preventative --yes
pulumi policy group edit "$POLICY_GROUP" --org "$ORG" \
    --add-policy-pack s3-baseline-policies \
    --add-stack s3-baseline/dev
pulumi policy group get "$POLICY_GROUP" --org "$ORG"
