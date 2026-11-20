#!/usr/bin/env bash
# start.sh - step 7, second half: start the update run that `pulumi up` created
# (project fleet-update, stack upgrade) and follow it until it finishes.
# The run upgrades the canary group, waits 60 seconds, then the rest group.
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_az

say "starting update run $RUN_NAME on fleet $FLEET_NAME"
az fleet updaterun start --resource-group "$FLEET_GROUP" --fleet-name "$FLEET_NAME" --name "$RUN_NAME"
wait_for_run

say "members and versions"
az aks list --resource-group "$FLEET_GROUP" --query '[].{name:name, version:kubernetesVersion}' -o table
