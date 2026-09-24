#!/usr/bin/env bash
# approve-and-apply.sh — a human, holding a full-permission token, applies
# the reviewed patch from 04-propose-change to the real 01-base-stack. This
# is the only script in the workshop that changes real infrastructure.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

PATCH_FILE="$FOLDER_DIR/../04-propose-change/logs-bucket.patch"
[ -f "$PATCH_FILE" ] || die "expected patch not found: $PATCH_FILE"

have pulumi || die "pulumi CLI is required"
have git || die "git is required (used to apply the patch)"

say "Applying the reviewed patch to the real 01-base-stack/index.ts"
( cd "$BASE_STACK_DIR/.." && git apply --check "$PATCH_FILE" ) \
  || die "logs-bucket.patch no longer applies cleanly — re-run 04-propose-change/propose.sh and re-review before approving"
( cd "$BASE_STACK_DIR/.." && git apply "$PATCH_FILE" )
note "01-base-stack/index.ts now includes the access-logs bucket and logging config"

say "Type-checking before applying"
( cd "$BASE_STACK_DIR" && npx tsc --noEmit )

say "This is a human decision from here: run pulumi up yourself."
note "cd $BASE_STACK_DIR && pulumi up --stack dev"
note "Use the token that holds Stack Write on this stack — not the agent's"
note "Stack-Read-only token from 03-agent-client. The point of this step is"
note "that a human, not the agent, makes this call."
note ""
note "After it succeeds: pulumi stack output accessLogsBucketName"
note "Check Pulumi Cloud's audit log for this stack: this update should be"
note "attributable to the human's token, distinct from the blocked attempt"
note "in 06-blocked-apply."
