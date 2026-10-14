#!/usr/bin/env bash
# Pulls every image the workshop needs on a machine with a working network,
# then loads each one into the kind node. Run it once before the session so a
# venue Wi-Fi failure cannot block step 2 or 3. The list matches
# `helm template` output for kube-prometheus-stack 91.9.0 and tempo 1.24.4,
# plus the Collector image pinned in 03-collector/index.ts.
set -euo pipefail

CLUSTER_NAME="${CLUSTER_NAME:-observability-workshop}"

IMAGES=(
    "quay.io/prometheus-operator/prometheus-operator:v0.94.1"
    "quay.io/prometheus-operator/prometheus-config-reloader:v0.94.1"
    "quay.io/prometheus/prometheus:v3.15.0"
    "quay.io/prometheus/alertmanager:v0.34.1"
    "quay.io/prometheus/node-exporter:v1.12.1-distroless"
    "registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.20.0"
    "ghcr.io/jkroepke/kube-webhook-certgen:1.8.9"
    "docker.io/grafana/grafana:13.2.3-distroless"
    "quay.io/kiwigrid/k8s-sidecar:2.11.2"
    "docker.io/grafana/tempo:2.9.0"
    "docker.io/otel/opentelemetry-collector-contrib:0.162.0"
    "docker.io/library/node:22-alpine"
)

for image in "${IMAGES[@]}"; do
    echo "Pulling ${image} ..."
    docker pull "${image}"
    echo "Loading ${image} into kind cluster ${CLUSTER_NAME} ..."
    kind load docker-image "${image}" --name "${CLUSTER_NAME}"
done

echo "Done. ${#IMAGES[@]} images cached in the kind node."
