#!/usr/bin/env bash
# Step 1: create the venv, the ESC environment and the stack, then run the baseline.
# Needs: PULUMI_ORG, ROLE_ARN (from oidc/create-oidc-role.sh), a logged-in Pulumi CLI.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_cmd pulumi python3 sed
require_org
[[ -n "${ROLE_ARN:-}" ]] || die "set ROLE_ARN to the IAM role ARN for ESC OIDC"

DIR="$(folder_dir 01-baseline)"
FQN="$(esc_fqn)"
cd "$DIR"

info "Python environment"
python3 -m venv venv
venv/bin/pip install -q -r requirements.txt

info "ESC environment $FQN"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
sed "s|ROLE_ARN_PLACEHOLDER|$ROLE_ARN|" esc/aws-prod.yaml >"$tmp"
if ! pulumi env get "$FQN" >/dev/null 2>&1; then
  pulumi env init "$FQN"
fi
pulumi env edit --file "$tmp" "$FQN"

info "Checking that the role resolves (values stay hidden)"
pulumi env run "$FQN" -- python3 -c "import os; print('AWS_ACCESS_KEY_ID set:', bool(os.environ.get('AWS_ACCESS_KEY_ID')))"

info "Stack $STACK"
pulumi stack select "$STACK" >/dev/null 2>&1 || pulumi stack init "$STACK"

echo "This links $ESC_PROJECT/$ESC_ENV to stack $STACK; Pulumi operations then run under that role."
if confirm "Link the environment to the stack?"; then
  pulumi config env add "$ESC_PROJECT/$ESC_ENV"
  pulumi config
else
  die "environment not linked; stack has no credentials"
fi

info "Baseline preview, then update"
pulumi preview
if confirm "Run pulumi up for the baseline?"; then
  pulumi up
fi
