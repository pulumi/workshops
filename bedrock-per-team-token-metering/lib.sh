#!/usr/bin/env bash
# lib.sh: shared bits for the demo scripts (sourced, not run).
# shellcheck disable=SC2034 # the variables are used by the scripts that source this file
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$WORKSHOP_DIR/02-platform"
POLICY_DIR="$WORKSHOP_DIR/07-policy"
STACK="${DEMO_STACK:-dev}"
ESC_PROJECT="bedrock-metering"
ESC_NAME="aws-login"
REGION="${AWS_REGION:-us-east-1}"
LOG_GROUP="/workshop/bedrock-invocations"
NAMESPACE="Workshop/Bedrock"

say() { printf '\n==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "$1 is required but not on PATH"; }

# The Pulumi organization: PULUMI_ORG, else the CLI default.
org() {
  if [ -n "${PULUMI_ORG:-}" ]; then printf '%s' "$PULUMI_ORG"; return; fi
  pulumi org get-default 2>/dev/null | head -n1 | tr -d '[:space:]'
}
esc_env() { printf '%s/%s/%s' "$(org)" "$ESC_PROJECT" "$ESC_NAME"; }

# Run the AWS CLI with the credentials the ESC environment mints.
aws_admin() { pulumi env run "$(esc_env)" -- aws "$@"; }

# Run a pulumi command in the platform project on the demo stack.
pulumi_stack() { (cd "$PROJECT_DIR" && pulumi --stack "$STACK" "$@"); }

# Make sure node_modules exist, then set the account id the program needs.
prepare_project() {
  [ -d "$PROJECT_DIR/node_modules" ] || (cd "$PROJECT_DIR" && npm ci)
  (cd "$PROJECT_DIR" && pulumi stack select --create "$STACK")
  local account
  account="$(aws_admin sts get-caller-identity --query Account --output text)"
  pulumi_stack config set accountId "$account"
}

# set_teams '<json>' : write the teams list and deploy.
set_teams() {
  prepare_project
  pulumi_stack config set teams "$1"
  pulumi_stack up --yes
}

stack_output() { pulumi_stack stack output "$1" --json; }
team_profile_arn() { stack_output teamProfiles | jq -r --arg t "$1" '.[$t]'; }
team_role_arn() { stack_output teamRoles | jq -r --arg t "$1" '.[$t]'; }

# Print "export AWS_..." lines for a team's role, for use inside a subshell.
assume_team() {
  local creds
  creds="$(aws_admin sts assume-role --role-arn "$(team_role_arn "$1")" --role-session-name "demo-$1" \
    --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' --output text)"
  read -r AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN <<<"$creds"
  export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_REGION="$REGION"
}
