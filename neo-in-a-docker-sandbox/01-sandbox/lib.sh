#!/usr/bin/env bash
# lib.sh — shared bits for the host-side demo scripts (sourced, not run).
# Everything here runs on your laptop, outside the sandbox.
# shellcheck disable=SC2034 # the variables are used by the scripts that source this file
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SANDBOX="${NEO_DEMO_SANDBOX:-neo-demo}"          # sbx sandbox name
PROJECT_DIR="$WORKSHOP_DIR/02-app"                # the workspace Neo works in
KIT_DIR="$WORKSHOP_DIR/neo-kit"
STACK="${NEO_DEMO_STACK:-dev}"                    # <org>/dev; the org comes from `pulumi org set-default` or PULUMI_ORG

say()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
note() { printf '  \033[2m%s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

# vergte <a> <b> — true when version a >= b (dotted numbers only; BSD/GNU sort agnostic)
vergte() {
  local lo
  lo="$(printf '%s\n%s\n' "$1" "$2" | sort -t. -k1,1n -k2,2n -k3,3n | head -n1)"
  [ "$lo" = "$2" ]
}

sandbox_exists() {
  sbx ls 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "$SANDBOX"
}
