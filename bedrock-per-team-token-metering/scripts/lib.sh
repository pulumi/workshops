#!/usr/bin/env bash
# lib.sh: shared bits for the demo scripts (sourced, not run).
# shellcheck disable=SC2034 # the variables are used by the scripts that source this file
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$WORKSHOP_DIR"           # the Pulumi project lives at the workshop root
POLICY_DIR="$WORKSHOP_DIR/policy"
STACK="${DEMO_STACK:-dev}"
ESC_PROJECT="bedrock-metering"
ESC_NAME="aws-login"
REGION="${AWS_REGION:-us-east-1}"   # one knob: export AWS_REGION to run the demo elsewhere
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
# The stack lives in the same organization as the ESC environment it imports.
stack_ref() { printf '%s/%s' "$(org)" "$STACK"; }

# Run the AWS CLI with the credentials the ESC environment mints.
aws_admin() { pulumi env run "$(esc_env)" -- aws "$@"; }

# Run a pulumi command in the platform project on the demo stack.
pulumi_stack() { (cd "$PROJECT_DIR" && pulumi --stack "$(stack_ref)" "$@"); }

stack_output() { pulumi_stack stack output "$1" --json; }
team_profile_arn() { stack_output teamProfiles | jq -r --arg t "$1" '.[$t]'; }
team_role_arn() { stack_output teamRoles | jq -r --arg t "$1" '.[$t]'; }
# team_limit <team> <perMinute|perDay>: the team's effective limit, from the stack outputs.
team_limit() { stack_output teamLimits | jq -r --arg t "$1" --arg k "$2" '.[$t][$k]'; }

# converse <profile-arn> <text> [extra aws args...]: one Converse call, with the command
# printed first so the audience sees what the client does. Credentials come from the caller.
converse() {
  local profile="$1" text="$2"; shift 2
  printf '$ aws bedrock-runtime converse --model-id %s \\\n    --messages %s %s\n' \
    "$profile" "'[{\"role\":\"user\",\"content\":[{\"text\":\"$text\"}]}]'" "$*"
  aws bedrock-runtime converse --region "$REGION" --model-id "$profile" \
    --messages "$(jq -nc --arg t "$text" '[{role:"user",content:[{text:$t}]}]')" "$@"
}

# Print "export AWS_..." lines for a team's role, for use inside a subshell.
# A role created seconds ago can still be unknown to STS (IAM propagation), so retry briefly.
assume_team() {
  local creds role attempt
  role="$(team_role_arn "$1")"
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    creds="$(aws_admin sts assume-role --role-arn "$role" --role-session-name "demo-$1" \
      --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' --output text 2>/dev/null)" && break
    [ "$attempt" -lt 10 ] || die "could not assume $role after $attempt attempts"
    printf 'waiting for IAM to propagate %s (attempt %s)\n' "$role" "$attempt" >&2; sleep 3
  done
  read -r AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN <<<"$creds"
  export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_REGION="$REGION"
}
