#!/usr/bin/env bash
# Step 1: create (or update) the ESC environment from gcp-oidc.yaml.
# Edit gcp-oidc.yaml with your project number, pool, provider and service
# account first. Usage: PULUMI_ORG=my-org ./create-env.sh
set -euo pipefail
# shellcheck source=../00-setup/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../00-setup/lib.sh"

require pulumi
require_var PULUMI_ORG

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_name="$PULUMI_ORG/gcp-monitoring-workshop/gcp-oidc"

if grep -q "123456789012" "$here/gcp-oidc.yaml"; then
  echo "gcp-oidc.yaml still has the placeholder project number; edit it first" >&2
  exit 1
fi

if pulumi env get "$env_name" >/dev/null 2>&1; then
  pulumi env edit --file "$here/gcp-oidc.yaml" "$env_name"
else
  pulumi env init --file "$here/gcp-oidc.yaml" "$env_name"
fi

echo "environment ready: $env_name"
echo "check it: pulumi env run $env_name -- env | grep -c GOOGLE_OAUTH_ACCESS_TOKEN"
