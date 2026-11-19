#!/usr/bin/env bash
# Step 9: deploy the SecureBucket stack with credentials from ESC.
# Usage: ORG=acme ./deploy.sh   (run from anywhere)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../lib.sh"
cd "$here/../06-secure-bucket"

npm install
pulumi stack select dev --create
pulumi config set aws:region "$REGION"
pulumi env run "$ESC_REF" -- pulumi up --yes --policy-pack ../05-policy-pack/policy
pulumi stack output bucketName
