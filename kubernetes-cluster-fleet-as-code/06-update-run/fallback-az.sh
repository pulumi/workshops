#!/usr/bin/env bash
# fallback-az.sh - step 7 fallback: create and start the same update run with
# the Azure CLI, in case the UpdateRun resource misbehaves on stage. Uses the
# same strategy, version and upgrade type as index.ts. Do not run it after
# `pulumi up` in this folder: the run name would collide.
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_az

say "creating update run $RUN_NAME (strategy $STRATEGY_NAME, Full, Kubernetes $TARGET_VERSION)"
az fleet updaterun create --resource-group "$FLEET_GROUP" --fleet-name "$FLEET_NAME" \
  --name "$RUN_NAME" --upgrade-type Full --kubernetes-version "$TARGET_VERSION" \
  --update-strategy-name "$STRATEGY_NAME"

say "starting it"
az fleet updaterun start --resource-group "$FLEET_GROUP" --fleet-name "$FLEET_NAME" --name "$RUN_NAME"
wait_for_run
