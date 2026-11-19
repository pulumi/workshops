#!/usr/bin/env bash
# Step 2: create the ESC environment and open it once to see the short-lived credentials.
# Usage: ORG=acme ROLE_ARN=arn:aws:iam::<account>:role/<role> ./create-environment.sh
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../lib.sh"
: "${ROLE_ARN:?Set ROLE_ARN to the IAM role that trusts Pulumi Cloud as an OIDC provider}"

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
sed "s|arn:aws:iam::123456789012:role/pulumi-esc-oidc|${ROLE_ARN}|" "$here/environment.yaml" > "$tmp"

pulumi env init "$ESC_REF"
pulumi env edit --file "$tmp" "$ESC_REF"

# Opens the environment and prints the resolved values. Only the key names matter on stage:
# aws.login.accessKeyId, secretAccessKey, sessionToken and the three environment variables.
pulumi env open "$ESC_REF"
