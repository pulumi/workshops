#!/usr/bin/env bash
# lib.sh - shared by create.sh and delete.sh. Source it, do not run it.

# name:group for every per-cluster environment; keep in step with 05-fleet-cluster/clusters.json
# shellcheck disable=SC2034 # read by create.sh and delete.sh, which source this file
CLUSTER_ENVS=("canary-1:canary" "rest-1:rest" "rest-2:rest")
INITIAL_VERSION="${INITIAL_VERSION:-1.35}"
LOCATION="${LOCATION:-westeurope}"

say() { printf '\n== %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

require_org() {
  have pulumi || die "pulumi CLI not found"
  : "${PULUMI_ORG:?set PULUMI_ORG to your Pulumi Cloud organization}"
}
