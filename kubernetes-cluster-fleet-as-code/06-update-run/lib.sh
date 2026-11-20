#!/usr/bin/env bash
# lib.sh - shared by start.sh and fallback-az.sh. Source it, do not run it.
say() { printf '\n== %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

FLEET_GROUP="${FLEET_GROUP:-rg-fleet-workshop}"
FLEET_NAME="${FLEET_NAME:-fleet-workshop}"
# shellcheck disable=SC2034 # read by fallback-az.sh, which sources this file
STRATEGY_NAME="two-waves"
TARGET_VERSION="${TARGET_VERSION:-1.36}"
RUN_NAME="${RUN_NAME:-upgrade-${TARGET_VERSION//./-}}"

require_az() {
  have az || die "Azure CLI (az) not found"
  az extension show --name fleet >/dev/null 2>&1 || az extension add --name fleet --yes
}

# Poll the update run until it leaves NotStarted/Running.
wait_for_run() {
  local state
  while true; do
    state="$(az fleet updaterun show --resource-group "$FLEET_GROUP" --fleet-name "$FLEET_NAME" \
      --name "$RUN_NAME" --query status.status.state -o tsv)"
    printf '%s  update run %s: %s\n' "$(date +%H:%M:%S)" "$RUN_NAME" "$state"
    case "$state" in
      Completed|Succeeded) return 0 ;;
      Failed|Stopped) return 1 ;;
    esac
    sleep 20
  done
}
