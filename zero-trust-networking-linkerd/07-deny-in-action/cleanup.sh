#!/usr/bin/env bash
# cleanup.sh — remove the throwaway unauthorized test client after step 7,
# so it doesn't linger into step 8's teardown or a re-run of the demo.
#
#   07-deny-in-action/cleanup.sh
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
CONTEXT="kind-$CLUSTER"

kubectl --context "$CONTEXT" delete -f "$DIR/unauthorized-client.yaml" --ignore-not-found
echo "cleanup OK: curl-client pod and ServiceAccount removed"
