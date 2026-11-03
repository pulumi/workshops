#!/usr/bin/env bash
# One-time setup, before the session: the ESC environment that vends short-lived AWS
# credentials, node_modules for the project and the policy pack, and the stack. After this,
# every Pulumi step is a plain `pulumi` command from the project root.
# Usage: ROLE_ARN=arn:aws:iam::<account>:role/<name> scripts/setup.sh
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need aws; need npm
[ -n "${ROLE_ARN:-}" ] || die "set ROLE_ARN to the IAM role the ESC environment should assume (it must trust Pulumi's OIDC for $(org))"

env_name="$(esc_env)"
say "ESC environment $env_name"
pulumi env init "$env_name" >/dev/null 2>&1 || true
tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
sed -e "s|__ROLE_ARN__|$ROLE_ARN|" -e "s|__REGION__|$REGION|" "$(dirname "${BASH_SOURCE[0]}")/aws-login.yaml" >"$tmp"
pulumi env edit --file "$tmp" "$env_name"

say "aws sts get-caller-identity (credentials from $env_name)"
aws_admin sts get-caller-identity

say "npm ci (project and policy pack)"
(cd "$PROJECT_DIR" && npm ci --silent)
(cd "$POLICY_DIR" && npm ci --silent)

say "Stack $(stack_ref)"
(cd "$PROJECT_DIR" && pulumi stack select --create "$(stack_ref)")
pulumi_stack config set aws:region "$REGION"

say "Ready. Next: pulumi up"
