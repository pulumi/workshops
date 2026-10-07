#!/usr/bin/env bash
# Step 8: remove the mistakes and preview again. The policy pack passes.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi
pulumi_stack config set demoViolations false
pulumi_stack preview --policy-pack ../07-policy
