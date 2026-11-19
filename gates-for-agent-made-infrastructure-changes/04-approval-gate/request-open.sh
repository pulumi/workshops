#!/usr/bin/env bash
# request-open.sh: the agent identity asks for access to the credential
# environment. Creates one pending open request and nothing else.
#
#   04-approval-gate/request-open.sh
#   REASON="add tagged, encrypted second bucket (change-ref CHG-1042)" 04-approval-gate/request-open.sh
#
# Run it logged in as the agent identity (pulumi whoami). The reviewer then
# approves and applies the request in the console (05-review-and-apply).
#
# Flags are the ones in the CLI reference (read 2026-10-23):
#   --access-duration-seconds  how long the grant lasts after the first open
#   --grant-expiration-seconds how long the approved grant can still be activated
# Both take a duration such as 30m or 4h (the docs example uses 2h and 24h), so
# the values below are written as durations, not bare seconds.
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org
require_cmd pulumi

REASON="${REASON:-Agent change: add a second S3 bucket that passes the mandatory policies}"
ACCESS_DURATION="${ACCESS_DURATION:-30m}"
GRANT_EXPIRATION="${GRANT_EXPIRATION:-4h}"

info "acting as: $(pulumi whoami)"
info "requesting open access to $(esc_fqn) for ${ACCESS_DURATION} (grant valid ${GRANT_EXPIRATION} to activate)"

pulumi env open-request "$(esc_fqn)" \
  --reason "$REASON" \
  --access-duration-seconds "$ACCESS_DURATION" \
  --grant-expiration-seconds "$GRANT_EXPIRATION"

info "pending. The request is in the Approvals tab of the environment; the stack is unchanged."
