#!/usr/bin/env bash
# lib.sh — shared helpers for the demo scripts. Source it, do not run it.
# shellcheck disable=SC2034  # variables are used by the scripts that source this file
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KUBECONFIG="$WORKSHOP_DIR/01-cluster/.state/kubeconfig"
export KUBECONFIG
NS="${NS:-demo}"
KIND_NAME="${KIND_NAME:-gpu-batch}"
STACK="${STACK:-dev}"

say() { printf '\n==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

need_cluster() {
  have kubectl || die "kubectl not installed"
  [ -f "$KUBECONFIG" ] || die "no $KUBECONFIG: run 'pulumi up' in 01-cluster first"
}
