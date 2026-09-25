#!/usr/bin/env bash
# reset.sh — between runs: leaves the cluster up but removes the demo
# workload created live in step 5 (04-admission-denied), so a re-run starts
# clean without recreating the whole cluster.
#
#   01-cluster/reset.sh
set -euo pipefail
CLUSTER="${POLICY_DEMO_CLUSTER:-policy-demo}"
CONTEXT="kind-$CLUSTER"

kubectl --context "$CONTEXT" delete pod unsafe-pod --ignore-not-found
echo "reset OK: removed any leftover unsafe-pod from step 5"
