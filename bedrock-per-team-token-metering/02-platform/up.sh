#!/usr/bin/env bash
# Step 2: deploy the foundation: log group, log-writer role, invocation logging, dashboard. No teams yet.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws; need npm
prepare_project
pulumi_stack config set teams '[]'
pulumi_stack preview
pulumi_stack up --yes
say "Invocation logging is on"
aws_admin bedrock get-model-invocation-logging-configuration --region "$REGION"
