#!/usr/bin/env bash
# Step 1 check: the ESC environment resolves to a real AWS identity.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws
say "aws sts get-caller-identity (credentials from $(esc_env))"
aws_admin sts get-caller-identity
