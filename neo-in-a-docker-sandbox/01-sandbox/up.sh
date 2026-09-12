#!/usr/bin/env bash
# up.sh — start (or re-attach to) the Neo sandbox on the demo project.
#
#   01-sandbox/up.sh                                   # create + attach; Neo TUI starts in 02-app
#   01-sandbox/up.sh --env NEO_SANDBOX_PERMISSION_MODE=read-only   # re-attach with a session override
#   01-sandbox/up.sh -- "what's in this stack?"        # pass a first prompt to pulumi neo
#
# First run: sbx pulls ghcr.io/dirien/infrastructure-sandbox:v0.9.0 (multi-GB;
# do this before the session) and asks you to approve the `pulumi` credential
# binding declared by the kit. The sandbox name is $NEO_DEMO_SANDBOX (neo-demo).
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
have sbx || die "sbx not installed"
cd "$WORKSHOP_DIR" || exit 1

if sandbox_exists; then
  say "re-attaching to sandbox '$SANDBOX'"
  exec sbx run --name "$SANDBOX" "$@"
else
  say "creating sandbox '$SANDBOX' from ./neo-kit with workspace ./02-app"
  note "kit: $KIT_DIR"
  exec sbx run --name "$SANDBOX" ./neo-kit ./02-app "$@"
fi
