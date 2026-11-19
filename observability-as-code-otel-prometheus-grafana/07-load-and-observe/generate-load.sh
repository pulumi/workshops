#!/usr/bin/env bash
# Sends steady traffic to the sample app's /work endpoint so step 7's end
# state -- a moving latency graph and a live trace waterfall -- has
# something to show. Run alongside port-forward.sh.
set -euo pipefail

DEMO_NAMESPACE="${DEMO_NAMESPACE:-demo}"
APP_SERVICE="${APP_SERVICE:-sample-app}"
LOCAL_PORT="${LOCAL_PORT:-8080}"
REQUESTS_PER_SECOND="${REQUESTS_PER_SECOND:-5}"

echo "Port-forwarding ${APP_SERVICE}.${DEMO_NAMESPACE} to localhost:${LOCAL_PORT} ..."
kubectl port-forward -n "${DEMO_NAMESPACE}" "svc/${APP_SERVICE}" "${LOCAL_PORT}:8080" &
FORWARD_PID=$!
trap 'kill "${FORWARD_PID}" 2>/dev/null' EXIT
sleep 2

echo "Generating load at ~${REQUESTS_PER_SECOND} req/s. Ctrl-C to stop."
INTERVAL=$(awk -v r="${REQUESTS_PER_SECOND}" 'BEGIN { print 1 / r }')
while true; do
    curl -s -o /dev/null "http://localhost:${LOCAL_PORT}/work" || true
    sleep "${INTERVAL}"
done
