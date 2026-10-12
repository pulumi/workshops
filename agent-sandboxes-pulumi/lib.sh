#!/usr/bin/env bash
# Shared settings for the demo scripts. Source it; do not run it.
set -euo pipefail

export AWS_REGION="${AWS_REGION:-eu-west-1}"
export AWS_DEFAULT_REGION="$AWS_REGION"
export ESC_PROJECT="agent-sandboxes"
export ESC_ENV="aws"
export PROVISIONER_ROLE="agent-sandbox-provisioner"
export BOUNDARY_POLICY="agent-sandbox-boundary"
export OIDC_URL="api.pulumi.com/oidc"
STATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.state"
export STATE_DIR
mkdir -p "$STATE_DIR"

# PULUMI_ORG is the Pulumi Cloud organization (or your user name on the Individual edition).
: "${PULUMI_ORG:?set PULUMI_ORG to your Pulumi Cloud organization}"

account_id() { aws sts get-caller-identity --query Account --output text; }
