#!/usr/bin/env bash
# Optional: enforce the policy pack from Pulumi Cloud instead of passing --policy-pack.
# Publishes policy/ to the organization, creates a Policy Group that holds only this
# stack, enables the pack in it, and adds the stack. After this, every preview and
# update of the stack runs the guardrails, from any machine and any client, with no
# flag. Safe to re-run: each step is skipped when it is already done.
# Usage: scripts/policy-enable.sh        (needs a Pulumi access token with org admin)
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need curl; need jq
org="$(org)"
pack="$(jq -r .name "$POLICY_DIR/package.json")"
version="$(jq -r .version "$POLICY_DIR/package.json")"
group="${POLICY_GROUP:-bedrock-metering}"
project="$(grep -E '^name:' "$PROJECT_DIR/Pulumi.yaml" | awk '{print $2}')"
token="${PULUMI_ACCESS_TOKEN:-$(jq -r '.accessTokens[.current]' ~/.pulumi/credentials.json)}"
api() { curl -sS -H "Authorization: token $token" -H "Accept: application/vnd.pulumi+8" -H "Content-Type: application/json" "$@"; }

say "Publish $pack@$version to $org"
if pulumi policy ls 2>/dev/null | awk -v p="$pack" '$1==p' | grep -q "$version"; then
  echo "already published"
else
  (cd "$POLICY_DIR" && pulumi policy publish "$org")
fi

say "Policy Group $group (stacks, preventative)"
if api -o /dev/null -w '%{http_code}' "https://api.pulumi.com/api/orgs/$org/policygroups/$group" | grep -q '^200$'; then
  echo "already exists"
else
  pulumi policy group new "$group" --org "$org" --entity-type stacks --mode preventative --yes
fi

say "Enable $pack@$version in $group"
if api "https://api.pulumi.com/api/orgs/$org/policygroups/$group" | jq -e --arg p "$pack" --arg v "$version" '.appliedPolicyPacks[] | select(.name==$p and .versionTag==$v)' >/dev/null; then
  echo "already enabled"
else
  pulumi policy enable "$org/$pack" "$version" --policy-group "$group"
fi

say "Add stack $project/$STACK to $group"
# `pulumi policy group edit --add-stack` is experimental and did not attach the stack
# (2026-11-03), so this goes straight to the API.
if api "https://api.pulumi.com/api/orgs/$org/policygroups/$group" | jq -e --arg s "$STACK" --arg p "$project" '.stacks[] | select(.name==$s and .routingProject==$p)' >/dev/null; then
  echo "already a member"
else
  api -X PATCH "https://api.pulumi.com/api/orgs/$org/policygroups/$group" -d "{\"addStack\":{\"name\":\"$STACK\",\"routingProject\":\"$project\"}}"
  echo "added"
fi

say "Result"
api "https://api.pulumi.com/api/orgs/$org/policygroups/$group" | jq '{name, mode, stacks, appliedPolicyPacks}'
echo "Next: pulumi preview (no --policy-pack needed). Policy results: https://app.pulumi.com/$org/$project/$STACK"
