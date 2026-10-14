#!/usr/bin/env bash
# reset.sh — between runs: leaves the cluster and mesh up but removes the
# demo services and policy objects created live in later steps, so a re-run
# starts clean without recreating the whole cluster.
#
#   01-cluster/reset.sh
set -euo pipefail
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
CONTEXT="kind-$CLUSTER"

kubectl --context "$CONTEXT" delete pod curl-client --ignore-not-found -n mesh-demo
echo "reset OK: removed any leftover curl-client test pod from step 7"
