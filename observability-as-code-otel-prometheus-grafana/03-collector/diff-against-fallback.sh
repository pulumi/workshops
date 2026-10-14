#!/usr/bin/env bash
# Diffs the Collector config running in the cluster against the known-good
# copy in fallback/collector.yaml. Use it when an edit to the pipeline breaks
# the Collector and the logs do not say why.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

NAMESPACE="${NAMESPACE:-monitoring}"

kubectl get configmap -n "${NAMESPACE}" -l app=otel-collector \
    -o jsonpath='{.items[0].data.collector\.yaml}' \
    | diff -u fallback/collector.yaml - || true
