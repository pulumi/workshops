#!/usr/bin/env bash
# propose.sh — apply the agent's proposed change (logs-bucket.patch) to a
# scratch copy of 01-base-stack and preview it. The outcome for this step is
# a diff/preview, never an apply: this script never calls `pulumi up`.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

have pulumi || die "pulumi CLI is required"
have git || die "git is required (used to apply the patch)"

say "Copying 01-base-stack to a scratch workspace"
make_scratch_copy
note "scratch copy at $SCRATCH_DIR/01-base-stack"

say "Applying the agent's proposed change (logs-bucket.patch)"
( cd "$SCRATCH_DIR" && git apply --check "$FOLDER_DIR/logs-bucket.patch" ) \
  || die "logs-bucket.patch no longer applies cleanly to 01-base-stack/index.ts"
( cd "$SCRATCH_DIR" && git apply "$FOLDER_DIR/logs-bucket.patch" )
note "patch applied to the scratch copy only; 01-base-stack/index.ts is untouched"

say "Type-checking the proposed change"
( cd "$SCRATCH_DIR/01-base-stack" && npx tsc --noEmit )
note "tsc passed"

say "Previewing the proposed change against a scratch local backend"
mkdir -p "$SCRATCH_DIR/pulumi-state"
export PULUMI_CONFIG_PASSPHRASE="workshop-demo"
pulumi login "file://$SCRATCH_DIR/pulumi-state" >/dev/null
trap 'pulumi logout >/dev/null 2>&1 || true' EXIT
(
  cd "$SCRATCH_DIR/01-base-stack"
  pulumi stack select dev --create
  pulumi preview --diff --stack dev
)

note "This was a preview only. Nothing was applied and nothing on the real"
note "stack changed. See 05-review-diff to check the proposal, then"
note "06-blocked-apply / 07-approve-and-apply for what happens next."
