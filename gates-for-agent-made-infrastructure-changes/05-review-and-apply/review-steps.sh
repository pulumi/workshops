#!/usr/bin/env bash
# review-steps.sh: print the reviewer's console steps for the pending open
# request. Changes nothing; approval and apply happen in the console.
#
#   05-review-and-apply/review-steps.sh
#
# The docs read 2026-10-23 describe approving and applying an open request in
# the console only (Approvals tab > Review changes > Apply changes). They give
# no CLI command for it, so this is not scripted.
# Source: https://www.pulumi.com/docs/esc/concepts/approvals/
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org

cat <<EOF
Reviewer steps for $(esc_fqn)

  1. Read the change first: the agent's pulumi preview diff (second bucket,
     three tags, public access block, encryption). Approve access to a change
     you have read, not to a request you have only skimmed.
  2. Console > environment > Approvals tab > Review changes.
  3. Approve (or close the request).
  4. Apply changes. Approval alone grants nothing: the grant is active only
     after the request is applied.
  5. Tell the agent. It now runs 05-review-and-apply/agent-up.sh inside the
     access duration. The grant lasts for the access duration counted from the
     first open, and must be activated within the grant expiration.
EOF
