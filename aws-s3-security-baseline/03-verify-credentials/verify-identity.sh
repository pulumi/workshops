#!/usr/bin/env bash
# Step 3: prove the credentials come from ESC. The ARN must be an assumed-role ARN.
# Usage: ORG=acme ./verify-identity.sh
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../lib.sh"

pulumi env run "$ESC_REF" -- aws sts get-caller-identity
