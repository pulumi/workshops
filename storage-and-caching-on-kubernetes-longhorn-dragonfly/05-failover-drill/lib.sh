#!/usr/bin/env bash
# Shared variables and helpers for the failover drill scripts in this
# folder. Sourced, not executed directly -- shellcheck disable is not
# needed since this file is never run on its own.
set -euo pipefail

CLUSTER_NAME="storage-caching-workshop-demo"
KUBE_CONTEXT="kind-${CLUSTER_NAME}"
NAMESPACE="caching-workshop"
DEPLOYMENT="record-writer"
# shellcheck disable=SC2034 # used by drill.sh, which sources this file
RECORD_FILE="/data/records.log"

k() {
    kubectl --context "$KUBE_CONTEXT" "$@"
}

# Name of the node currently running the record-writer pod. Empty string if
# no pod is found (caller should treat that as "nothing to drill yet").
current_node() {
    k -n "$NAMESPACE" get pods -l app="$DEPLOYMENT" \
        -o jsonpath='{.items[0].spec.nodeName}' 2>/dev/null || true
}

# Name of the record-writer pod currently Running (may be empty during a
# reschedule).
current_pod() {
    k -n "$NAMESPACE" get pods -l app="$DEPLOYMENT" \
        --field-selector=status.phase=Running \
        -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true
}
