#!/usr/bin/env bash
# status.sh — show the cluster's current replication state.
#
#   03-replication/status.sh
#
# Read-only: this changes nothing in the cluster. Point it at the demo
# audience while it runs and call out two things in the output:
#   - both replicas show "Streaming replication" (not "Not reachable" or
#     stuck in "Recovering")
#   - "Replication lag" (or the write/flush/replay lag columns, depending on
#     plugin version) sits at or near 0 bytes/seconds for each replica
# If a replica is missing from the list, or lag keeps growing instead of
# holding near zero, that is the thing to stop and investigate before moving
# on to the failover step.
#
# Command syntax confirmed against cloudnative-pg.io/docs/1.30/kubectl-plugin
# (2026-09-27): `kubectl cnpg status <cluster>` reads instance roles and
# replication status directly from the cluster; no flags are required beyond
# targeting the right namespace and context.
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-pg-cluster}"
NAMESPACE="${NAMESPACE:-postgres-demo}"
KUBE_CONTEXT="${KUBE_CONTEXT:-kind-pg-workshop-demo}"
# The three variables above match what 01-cluster-and-operator and
# 02-postgres-cluster provision by default. If the presenter renamed the
# cluster, namespace, or kind cluster, override them instead of editing this
# file, e.g.:
#   NAMESPACE=$(pulumi stack output namespace --cwd ../02-postgres-cluster) \
#     03-replication/status.sh
# or export the three vars before running any script in this folder.

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }

say "cluster: $CLUSTER_NAME  namespace: $NAMESPACE  context: $KUBE_CONTEXT"
say "checking replication status (read-only, changes nothing)"

kubectl cnpg status "$CLUSTER_NAME" -n "$NAMESPACE" --context "$KUBE_CONTEXT"

say "look for: both replicas 'Streaming replication', lag near zero on each"
