#!/usr/bin/env bash
# failover.sh — trigger a scripted switchover and watch the new primary come up.
#
#   04-failover/failover.sh
#
# This is a SCRIPTED trigger: it asks the operator to promote instance 2 via
# the supported `kubectl cnpg promote` path. It never simulates a crash with
# `kill -9` or by deleting the primary pod — CloudNativePG's own failover
# detection is a separate thing to demo on its own terms, and an unscripted
# kill is not reproducible in front of an audience. This script only exists
# to make the outcome (a graceful, operator-driven switchover) visible and
# repeatable run after run.
#
# Command syntax confirmed against cloudnative-pg.io/docs/1.30/kubectl-plugin
# (2026-09-27): `kubectl cnpg promote CLUSTER INSTANCE` promotes the named
# replica (by its instance number) to primary.
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-pg-cluster}"
NAMESPACE="${NAMESPACE:-postgres-demo}"
KUBE_CONTEXT="${KUBE_CONTEXT:-kind-pg-workshop-demo}"
PROMOTE_INSTANCE="${PROMOTE_INSTANCE:-2}"
# Override any of the above if the presenter renamed something in
# 01-cluster-and-operator or 02-postgres-cluster, e.g.:
#   CLUSTER_NAME=$(pulumi stack output clusterName --cwd ../02-postgres-cluster) \
#     04-failover/failover.sh

POLL_SECONDS="${POLL_SECONDS:-3}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-60}"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

say "cluster: $CLUSTER_NAME  namespace: $NAMESPACE  context: $KUBE_CONTEXT"
say "promoting instance $PROMOTE_INSTANCE to primary (scripted switchover)"

kubectl cnpg promote "$CLUSTER_NAME" "$PROMOTE_INSTANCE" -n "$NAMESPACE" --context "$KUBE_CONTEXT"

say "waiting up to ${TIMEOUT_SECONDS}s for instance $PROMOTE_INSTANCE to report as primary"

elapsed=0
new_primary_name=""
while [ "$elapsed" -lt "$TIMEOUT_SECONDS" ]; do
  status_output="$(kubectl cnpg status "$CLUSTER_NAME" -n "$NAMESPACE" --context "$KUBE_CONTEXT" 2>/dev/null || true)"
  # The status table names instances like "<cluster>-<n>" and marks the
  # primary row; matching on the instance suffix plus "Primary" avoids
  # depending on exact column widths, which change across cnpg versions.
  candidate_line="$(printf '%s\n' "$status_output" | grep -E "^\s*${CLUSTER_NAME}-${PROMOTE_INSTANCE}\s" || true)"
  if printf '%s\n' "$candidate_line" | grep -qi "primary"; then
    new_primary_name="$(printf '%s\n' "$candidate_line" | awk '{print $1}')"
    break
  fi
  printf '.'
  sleep "$POLL_SECONDS"
  elapsed=$((elapsed + POLL_SECONDS))
done
printf '\n'

if [ -n "$new_primary_name" ]; then
  say "promotion complete: $new_primary_name is now primary (after ~${elapsed}s)"
  say "run 03-replication/status.sh again to confirm the old primary rejoined as a streaming replica"
else
  die "instance $PROMOTE_INSTANCE did not report as primary within ${TIMEOUT_SECONDS}s — run 'kubectl cnpg status $CLUSTER_NAME -n $NAMESPACE --context $KUBE_CONTEXT' by hand to see what is happening"
fi
