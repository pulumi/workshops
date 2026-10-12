#!/usr/bin/env bash
# Step 3: deploy the boundary policy and keep its ARN for the orchestrator.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
source "$here/../lib.sh"

cd "$here"
pulumi stack select --create "$PULUMI_ORG/agent-sandbox-boundary/shared"
pulumi config env add "$ESC_PROJECT/$ESC_ENV" --yes
pulumi up --yes
pulumi stack output boundaryArn | tee "$STATE_DIR/boundary-arn"
