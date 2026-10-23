#!/usr/bin/env bash
# agent-up.sh: the agent applies the policy-clean change after the reviewer has
# approved and applied the open request.
#
#   05-review-and-apply/agent-up.sh                 # preview, then pulumi up (asks to confirm)
#   ASSUME_YES=1 05-review-and-apply/agent-up.sh    # skip the confirmation (rehearsal only)
#
# Run it logged in as the agent identity, inside the access duration. Without an
# active grant, pulumi up fails when it tries to open the credential
# environment; it does not wait for approval.
#
# PROGRAM_DIR is the folder holding the Pulumi program with the second bucket.
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org
require_cmd pulumi

PROGRAM_DIR="${PROGRAM_DIR:-$(folder_dir 01-baseline)}"
[ -f "$PROGRAM_DIR/Pulumi.yaml" ] || die "no Pulumi.yaml in $PROGRAM_DIR; set PROGRAM_DIR to the program folder"

info "acting as: $(pulumi whoami)"

pulumi preview --cwd "$PROGRAM_DIR" --stack "$STACK"

if [ "${ASSUME_YES:-0}" = "1" ]; then
  pulumi up --cwd "$PROGRAM_DIR" --stack "$STACK" --yes
else
  pulumi up --cwd "$PROGRAM_DIR" --stack "$STACK"
fi

info "done. Check the bucket with 05-review-and-apply/verify-bucket.sh <bucket-name>"
