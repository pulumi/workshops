#!/usr/bin/env bash
# reset.sh — back to a clean state between runs (host side).
#
#   01-sandbox/reset.sh             # remove the sandbox, restore index.ts, reconcile the stack to the baseline
#   01-sandbox/reset.sh --destroy   # …and tear the bucket down (unprotect + destroy), e.g. after the last session
#   01-sandbox/reset.sh --keep-sandbox   # only restore code + stack, keep the sandbox VM (faster re-attach)
#
# Needs: pulumi login on the host with access to the ESC environment (the stack
# imports it), git. The guard inside the sandbox does not apply here: this runs
# on your laptop, which is exactly where a human-driven destroy belongs.
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

destroy=0; keep=0
for a in "$@"; do case "$a" in --destroy) destroy=1 ;; --keep-sandbox) keep=1 ;; *) die "unknown flag $a" ;; esac; done

if [ "$keep" -eq 0 ] && have sbx && sandbox_exists; then
  say "removing sandbox '$SANDBOX'"
  sbx rm -f "$SANDBOX"
fi

say "restoring the baseline program"
git -C "$WORKSHOP_DIR" checkout -- 02-app/index.ts
git -C "$WORKSHOP_DIR" status --short -- 02-app | sed 's/^/  /' || true

cd "$PROJECT_DIR"
[ -d node_modules ] || npm install --no-audit --no-fund --loglevel=error
if [ "$destroy" -eq 1 ]; then
  say "unprotecting + destroying stack $STACK (human-driven, on the host)"
  pulumi state unprotect --all --yes --stack "$STACK"
  pulumi destroy --yes --stack "$STACK"
  note "the stack itself is kept; remove it with: pulumi stack rm $STACK"
else
  say "reconciling stack $STACK to the baseline (removes what Neo added, keeps the bucket)"
  pulumi up --yes --stack "$STACK"
fi
say "clean"
