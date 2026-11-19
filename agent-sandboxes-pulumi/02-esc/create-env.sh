#!/usr/bin/env bash
# Step 2: create the Pulumi ESC environment agent-sandboxes/aws (aws-login via OIDC, 1h).
# Then prove it: open it and print only the expiry-relevant facts, never the secrets.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
source "$here/../lib.sh"

acct="$(cat "$STATE_DIR/account-id")"
def="$STATE_DIR/aws.yaml"
sed -e "s/__ACCOUNT__/$acct/g" "$here/aws.yaml.tmpl" >"$def"

ref="$PULUMI_ORG/$ESC_PROJECT/$ESC_ENV"
pulumi env init "$ref" 2>/dev/null || echo "environment $ref already exists"
pulumi env edit --file "$def" "$ref"

echo "--- proof: the credentials come from the environment, not from disk"
pulumi env run "$ref" -- aws sts get-caller-identity --query Arn --output text
# shellcheck disable=SC2016
pulumi env run "$ref" -- bash -c 'echo "key id prefix: ${AWS_ACCESS_KEY_ID:0:4} (ASIA = temporary)"; echo "session token set: ${AWS_SESSION_TOKEN:+yes}"'
