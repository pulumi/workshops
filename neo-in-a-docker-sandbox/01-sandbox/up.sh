#!/usr/bin/env bash
# up.sh — start (or re-attach to) the demo sandbox on the demo project.
#
#   01-sandbox/up.sh            # create + attach: a shell in the VM, then run the Pulumi CLI as usual
#   01-sandbox/up.sh --fresh    # remove an existing neo-demo first, then create it again
#
# It runs the published sandbox kit from dirien/infrastructure-sandbox-kit plus a
# one-file mixin that adds this demo's regional AWS endpoints:
#   sbx run --name neo-demo --kit ./01-sandbox/region-kit \
#     ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0 ./02-app
# First run: sbx pulls the template image (multi-GB; do this before the session)
# and asks you to approve the `pulumi` credential binding the kit declares.
# Inside the shell: `pulumi whoami -v`, then `pulumi neo`.
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
have sbx || die "sbx not installed"
cd "$WORKSHOP_DIR" || exit 1

if [ "${1:-}" = "--fresh" ]; then
  shift
  if sandbox_exists; then
    say "removing sandbox '$SANDBOX' so the next one starts clean"
    sbx rm -f "$SANDBOX"
  fi
fi

if sandbox_exists; then
  say "re-attaching to sandbox '$SANDBOX'"
  exec sbx run --name "$SANDBOX" "$@"
else
  say "creating sandbox '$SANDBOX' from $KIT_REF with workspace ./02-app"
  note "region mixin: $REGION_KIT ($AWS_REGION)"
  exec sbx run --name "$SANDBOX" --kit "$REGION_KIT" "$KIT_REF" ./02-app "$@"
fi
