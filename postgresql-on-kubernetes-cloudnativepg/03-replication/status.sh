#!/usr/bin/env bash
set -euo pipefail

# --- Configuration (override via environment variables) ---------------------
# Defaults match this workshop's fixed demo cluster (see ../02-cluster). To
# derive live values from the deployed Pulumi stack instead of hardcoding them:
#   NAMESPACE=$(pulumi stack output namespace -C ../02-cluster)
#   CLUSTER_NAME=$(pulumi stack output clusterName -C ../02-cluster)
NAMESPACE="${NAMESPACE:-cnpg-demo}"
CLUSTER_NAME="${CLUSTER_NAME:-pg-demo}"

say() { printf '>>> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

command -v kubectl >/dev/null 2>&1 || die "kubectl not found on PATH"
command -v kubectl-cnpg >/dev/null 2>&1 \
  || die "kubectl cnpg plugin not found on PATH (looked for 'kubectl-cnpg'). Install: https://cloudnative-pg.io/documentation/current/kubectl-plugin/"

say "Cluster status and replication detail for '${CLUSTER_NAME}' (namespace: ${NAMESPACE})"
say "The Streaming Replication status table below reports Write/Flush/Replay Lag per replica."
kubectl cnpg status "${CLUSTER_NAME}" -n "${NAMESPACE}" --verbose

say "Pod roles at a glance (primary vs. replica)"
kubectl get pods -n "${NAMESPACE}" -l "cnpg.io/cluster=${CLUSTER_NAME}" -L role
