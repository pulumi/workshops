#!/usr/bin/env bash
# Step 1: create the ESC environment that vends short-lived AWS credentials.
# Prerequisite (done before the session): an IAM OIDC provider for
# https://api.pulumi.com/oidc with audience aws:<org>, and a role it can assume.
# Usage: ROLE_ARN=arn:aws:iam::<account>:role/<name> ./create-env.sh
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi
[ -n "${ROLE_ARN:-}" ] || die "set ROLE_ARN to the IAM role the ESC environment should assume"
env_name="$(esc_env)"
say "Creating $env_name"
pulumi env init "$env_name" >/dev/null 2>&1 || true
tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
sed "s|__ROLE_ARN__|$ROLE_ARN|" "$(dirname "${BASH_SOURCE[0]}")/aws-login.yaml" >"$tmp"
pulumi env edit --file "$tmp" "$env_name"
say "Environment definition (secrets hidden)"
pulumi env get "$env_name"
