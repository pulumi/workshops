#!/usr/bin/env bash
# reset.sh: remove the demo workloads but keep the cluster and Longhorn, so the
# demo can be run again from step 4. Use it between rehearsals.
#
#   scripts/reset.sh
set -euo pipefail

CTX="${CTX:-kind-storage-workshop}"
k() { kubectl --context "$CTX" -n demo "$@"; }

k delete job cache-client --ignore-not-found
k delete deploy record-keeper dragonfly --ignore-not-found
k delete svc dragonfly --ignore-not-found
k delete pvc record-data --ignore-not-found
rm -f "$(dirname "${BASH_SOURCE[0]}")/../05-node-failure/.failed-node"
echo "demo workloads removed. If the Pulumi stacks of 04 and 06 are still deployed, run pulumi refresh there."
