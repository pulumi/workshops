#!/usr/bin/env bash
# lift-guard.sh — a human lifts (or re-arms) the command guard for the sandbox.
#   03-guardrails/lift-guard.sh        # lift: creates ~/.config/neo-sandbox/allow-destructive in the VM
#   03-guardrails/lift-guard.sh --arm  # re-arm: removes it
# Use it only when you, not the agent, want to run a destructive command inside
# the sandbox. Teardown for the workshop runs on the host (01-sandbox/reset.sh).
# shellcheck disable=SC2016 # single-quoted $HOME is expanded inside the sandbox, on purpose
set -euo pipefail
# shellcheck source=../01-sandbox/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-sandbox/lib.sh"
have sbx || die "sbx not installed"
sandbox_exists || die "sandbox '$SANDBOX' does not exist"
if [ "${1:-}" = "--arm" ]; then
  sbx exec "$SANDBOX" sh -c 'rm -f "$HOME/.config/neo-sandbox/allow-destructive" && echo "guard re-armed"'
else
  sbx exec "$SANDBOX" sh -c 'mkdir -p "$HOME/.config/neo-sandbox" && touch "$HOME/.config/neo-sandbox/allow-destructive" && echo "guard lifted for this sandbox (re-arm with --arm)"'
fi
