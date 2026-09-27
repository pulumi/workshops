#!/usr/bin/env bash
# backup.sh — trigger an on-demand backup via the Barman Cloud Plugin and
# wait for it to complete.
#
#   05-backup/backup.sh
#
# Command syntax confirmed against cloudnative-pg.io/docs/1.30/kubectl-plugin
# (2026-09-27): the plugin-based path is
#   kubectl cnpg backup -n <namespace> <cluster> \
#     --method=plugin --plugin-name=barman-cloud.cloudnative-pg.io
# The docs explicitly call out that this replaces the older in-tree syntax
# `--method=barmanObjectStore`, which this workshop's cluster does not use
# (02-postgres-cluster provisions the Barman Cloud Plugin path, not the
# deprecated in-tree barmanObjectStore field).
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-pg-cluster}"
NAMESPACE="${NAMESPACE:-postgres-demo}"
KUBE_CONTEXT="${KUBE_CONTEXT:-kind-pg-workshop-demo}"
# Override any of the above if the presenter renamed something in
# 01-cluster-and-operator or 02-postgres-cluster, e.g.:
#   NAMESPACE=$(pulumi stack output namespace --cwd ../02-postgres-cluster) \
#     05-backup/backup.sh

POLL_SECONDS="${POLL_SECONDS:-3}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-60}"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

say "cluster: $CLUSTER_NAME  namespace: $NAMESPACE  context: $KUBE_CONTEXT"
say "requesting an on-demand backup via the Barman Cloud Plugin"

kubectl cnpg backup -n "$NAMESPACE" "$CLUSTER_NAME" \
  --method=plugin \
  --plugin-name=barman-cloud.cloudnative-pg.io \
  --context "$KUBE_CONTEXT"

say "waiting up to ${TIMEOUT_SECONDS}s for the Backup object to reach phase 'completed'"

elapsed=0
phase=""
backup_name=""
while [ "$elapsed" -lt "$TIMEOUT_SECONDS" ]; do
  # Newest Backup object for this cluster, by creation timestamp.
  backup_name="$(kubectl get backup -n "$NAMESPACE" --context "$KUBE_CONTEXT" \
    -l "cnpg.io/cluster=${CLUSTER_NAME}" \
    --sort-by=.metadata.creationTimestamp \
    -o jsonpath='{.items[-1:].metadata.name}' 2>/dev/null || true)"
  if [ -n "$backup_name" ]; then
    phase="$(kubectl get backup "$backup_name" -n "$NAMESPACE" --context "$KUBE_CONTEXT" \
      -o jsonpath='{.status.phase}' 2>/dev/null || true)"
    if [ "$phase" = "completed" ]; then
      break
    fi
    if [ "$phase" = "failed" ]; then
      die "backup '$backup_name' reported phase 'failed' — run 'kubectl describe backup $backup_name -n $NAMESPACE --context $KUBE_CONTEXT' to see why"
    fi
  fi
  printf '. (phase: %s)' "${phase:-pending}"
  sleep "$POLL_SECONDS"
  elapsed=$((elapsed + POLL_SECONDS))
done
printf '\n'

if [ "$phase" = "completed" ]; then
  say "backup '$backup_name' completed (after ~${elapsed}s)"
else
  die "no Backup object reached phase 'completed' within ${TIMEOUT_SECONDS}s (last seen phase: ${phase:-none})"
fi

# The Backup object reaching 'completed' means CloudNativePG's own reconcile
# loop is satisfied, but it does not by itself prove the object landed in the
# S3 bucket — this sandbox has neither the AWS CLI nor AWS credentials, so
# that last check is the presenter's own, on their laptop:
say "this sandbox cannot verify the object in S3 (no AWS CLI, no AWS credentials here)"
say "on your own machine, with your AWS credentials, confirm it landed with:"
echo "  aws s3 ls s3://\$(pulumi stack output bucketName --cwd ../02-postgres-cluster)/backups/ --recursive"
