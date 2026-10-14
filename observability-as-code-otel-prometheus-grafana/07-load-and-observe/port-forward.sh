#!/usr/bin/env bash
# Port-forwards Grafana and Prometheus to localhost so the presenter can show
# the dashboard (step 5) and the Alerts page (step 6) without an Ingress.
set -euo pipefail

MONITORING_NAMESPACE="${MONITORING_NAMESPACE:-monitoring}"
GRAFANA_SERVICE="${GRAFANA_SERVICE:-kube-prometheus-stack-grafana}"
PROMETHEUS_SERVICE="${PROMETHEUS_SERVICE:-kube-prometheus-stack-kube-prom-prometheus}"

echo "Grafana:    http://localhost:3000  (admin / the grafanaAdminPassword secret from 02-metrics-stack)"
echo "Prometheus: http://localhost:9090"
echo "Ctrl-C to stop both."

kubectl port-forward -n "${MONITORING_NAMESPACE}" "svc/${GRAFANA_SERVICE}" 3000:80 &
GRAFANA_PID=$!
kubectl port-forward -n "${MONITORING_NAMESPACE}" "svc/${PROMETHEUS_SERVICE}" 9090:9090 &
PROMETHEUS_PID=$!

trap 'kill "${GRAFANA_PID}" "${PROMETHEUS_PID}" 2>/dev/null' EXIT
wait
