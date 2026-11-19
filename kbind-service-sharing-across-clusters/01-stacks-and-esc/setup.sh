#!/usr/bin/env bash
# setup.sh — create stacks and ESC environments, and link them.
#
#   01-stacks-and-esc/setup.sh                    # provider-dev and consumer-a-dev (demo step 1)
#   01-stacks-and-esc/setup.sh provider-dev       # one stack
#   01-stacks-and-esc/setup.sh consumer-b-dev     # the second consumer (demo step 8)
#
# For each stack: pulumi stack init, pulumi env init, pulumi env edit --file, and
# pulumi config env add. `config env add` shows a diff and asks you to confirm; this
# script does not pass --yes. Needs KBIND_AWS_ROLE_ARN (see README).
# Safe to re-run: existing stacks and environments are kept.
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
set -euo pipefail

need_org
[ -n "${KBIND_AWS_ROLE_ARN:-}" ] || die "set KBIND_AWS_ROLE_ARN to the IAM role ARN that trusts the Pulumi OIDC issuer"

stacks=("$@")
[ "${#stacks[@]}" -gt 0 ] || stacks=("$PROVIDER_STACK" "$CONSUMER_A_STACK")

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

for stack in "${stacks[@]}"; do
  dir="$(stack_dir "$stack")"
  env="$(esc_env "$stack")"
  [ -f "$ENVS_DIR/$stack.yaml" ] || die "no environment definition for $stack in $ENVS_DIR"

  say "$stack"
  [ -d "$dir/node_modules" ] || run npm install --prefix "$dir"

  if pulumi stack ls --cwd "$dir" 2>/dev/null | awk 'NR>1 {print $1}' | tr -d '*' | grep -qx "$stack"; then
    note "stack $stack exists"
  else
    run pulumi stack init "$ORG/$stack" --cwd "$dir"
  fi

  if pulumi env get "$env" >/dev/null 2>&1; then
    note "environment $env exists"
  else
    run pulumi env init "$env"
  fi
  sed "s|__AWS_ROLE_ARN__|$KBIND_AWS_ROLE_ARN|" "$ENVS_DIR/$stack.yaml" >"$tmp"
  run pulumi env edit --file "$tmp" "$env"

  if pulumi config env ls --stack "$ORG/$stack" --cwd "$dir" 2>/dev/null | grep -q "$ESC_PROJECT/$stack"; then
    note "stack $stack already imports $ESC_PROJECT/$stack"
  else
    note "confirm the change when pulumi asks"
    run pulumi config env add "$ESC_PROJECT/$stack" --stack "$ORG/$stack" --cwd "$dir"
  fi
done

say "proof"
for stack in "${stacks[@]}"; do
  run pulumi config --stack "$ORG/$stack" --cwd "$(stack_dir "$stack")"
done
note "aws:region should read $AWS_REGION. Credentials are minted when a command runs, not stored."
