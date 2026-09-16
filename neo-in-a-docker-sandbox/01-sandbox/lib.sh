#!/usr/bin/env bash
# lib.sh — shared bits for the host-side demo scripts (sourced, not run).
# Everything here runs on your laptop, outside the sandbox.
# shellcheck disable=SC2034 # the variables are used by the scripts that source this file
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SANDBOX="${NEO_DEMO_SANDBOX:-neo-demo}"          # sbx sandbox name
PROJECT_DIR="$WORKSHOP_DIR/02-app"                # the workspace Neo works in
STACK="${NEO_DEMO_STACK:-dev}"                    # <org>/dev; the org comes from `pulumi org set-default` or PULUMI_ORG

# The published sandbox kit from dirien/infrastructure-sandbox-kit. It names the
# template image (ghcr.io/dirien/infrastructure-sandbox:v0.10.0), declares the
# `pulumi` credential and the egress allow-list. Pinned to an immutable tag.
KIT_REF="${NEO_DEMO_KIT:-ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0}"

# A one-file mixin kit that adds the regional AWS endpoints the demo stack needs
# (the published kit allows sts.amazonaws.com only). It rides along with this
# sandbox, so no global network policy changes and other sandboxes stay as they
# are. Edit the region in its spec.yaml.
REGION_KIT="$WORKSHOP_DIR/01-sandbox/region-kit"
AWS_REGION="$(sed -n 's/^[[:space:]]*-[[:space:]]*s3\.\([a-z0-9-]*\)\.amazonaws\.com.*/\1/p' "$REGION_KIT/spec.yaml" 2>/dev/null | head -n1)"
AWS_REGION="${AWS_REGION:-eu-central-1}"

# The ESC environment the demo stack imports, read from 02-app/Pulumi.dev.yaml
# (written there by `pulumi config env add`). Empty until you add one.
esc_env() {
  sed -n '/^environment:/,/^[^ -]/p' "$PROJECT_DIR/Pulumi.dev.yaml" 2>/dev/null \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' | head -n1
}

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
