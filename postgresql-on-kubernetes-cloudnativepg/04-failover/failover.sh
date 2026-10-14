#!/usr/bin/env bash
set -euo pipefail

# --- Configuration (override via environment variables) ---------------------
# Defaults match this workshop's fixed demo cluster (see ../02-cluster). To
# derive live values from the deployed Pulumi stack instead of hardcoding them:
#   NAMESPACE=$(pulumi stack output namespace -C ../02-cluster)
#   CLUSTER_NAME=$(pulumi stack output clusterName -C ../02-cluster)
NAMESPACE="${NAMESPACE:-cnpg-demo}"
CLUSTER_NAME="${CLUSTER_NAME:-pg-demo}"

# Target replica to promote: either a bare instance ordinal (e.g. "2") or a
# full pod name (e.g. "pg-demo-2") -- kubectl cnpg promote accepts both forms.
# Defaults to instance 2, a non-primary replica in this workshop's fixed
# 3-instance demo cluster. This is always a graceful, intentional promotion
# (a planned switchover for maintenance), never a simulated crash.
TARGET="${1:-2}"

TIMEOUT_SECS="${TIMEOUT_SECS:-60}"
POLL_INTERVAL_SECS="${POLL_INTERVAL_SECS:-3}"

say() { printf '>>> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

command -v kubectl >/dev/null 2>&1 || die "kubectl not found on PATH"
command -v kubectl-cnpg >/dev/null 2>&1 \
  || die "kubectl cnpg plugin not found on PATH (looked for 'kubectl-cnpg'). Install: https://cloudnative-pg.io/documentation/current/kubectl-plugin/"

# Normalize TARGET to a full pod name so it can be recognized in status output.
case "${TARGET}" in
  "${CLUSTER_NAME}"-*) expected_primary="${TARGET}" ;;
  *) expected_primary="${CLUSTER_NAME}-${TARGET}" ;;
esac

PRIMARY=""
INSTANCES=""
READY=""

# Populates PRIMARY / INSTANCES / READY from a single `kubectl cnpg status`
# call, parsed from its "Primary instance:", "Instances:" and "Ready
# instances:" summary lines. Using one call per poll (rather than separate
# calls per field) keeps this cheap: `status` execs into pods to gather data.
poll_status() {
  local summary
  summary="$(kubectl cnpg status "${CLUSTER_NAME}" -n "${NAMESPACE}")"
  PRIMARY="$(printf '%s\n' "${summary}" | grep -E '^Primary instance:' | awk '{print $3}')"
  INSTANCES="$(printf '%s\n' "${summary}" | grep -E '^Instances:' | awk '{print $2}')"
  READY="$(printf '%s\n' "${summary}" | grep -E '^Ready instances:' | awk '{print $3}')"
}

show_topology() {
  kubectl get pods -n "${NAMESPACE}" -l "cnpg.io/cluster=${CLUSTER_NAME}" -L role
}

poll_status
say "Topology before promotion (namespace: ${NAMESPACE}, cluster: ${CLUSTER_NAME})"
say "Current primary: ${PRIMARY} (${READY}/${INSTANCES} instances ready)"
show_topology

say "Gracefully promoting '${expected_primary}' to primary (planned switchover, not a failure simulation)"
kubectl cnpg promote "${CLUSTER_NAME}" "${TARGET}" -n "${NAMESPACE}"

say "Waiting up to ${TIMEOUT_SECS}s for '${expected_primary}' to become primary with all instances ready..."
elapsed=0
while (( elapsed < TIMEOUT_SECS )); do
  poll_status
  if [[ "${PRIMARY}" == "${expected_primary}" && -n "${INSTANCES}" && "${INSTANCES}" == "${READY}" ]]; then
    say "Promotion complete after ~${elapsed}s (primary: ${PRIMARY}, ${READY}/${INSTANCES} ready)"
    break
  fi
  sleep "${POLL_INTERVAL_SECS}"
  elapsed=$(( elapsed + POLL_INTERVAL_SECS ))
done

if [[ "${PRIMARY}" != "${expected_primary}" ]]; then
  die "Timed out after ${TIMEOUT_SECS}s waiting for '${expected_primary}' to become primary (last seen primary: '${PRIMARY}'). Check 'kubectl cnpg status ${CLUSTER_NAME} -n ${NAMESPACE} --verbose' for details."
fi

say "Topology after promotion"
say "Current primary: ${PRIMARY} (${READY}/${INSTANCES} instances ready)"
show_topology
