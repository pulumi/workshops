#!/bin/bash
# Usage: configure.sh <cache|nocache> <agent-pull-policy> <template-pull-policy|none>
# Rewrites the worker template and agent setting, then restarts the agent.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
template=$1 agent_policy=$2 worker_policy=$3
if [ "$worker_policy" = none ]; then line=""; else line="imagePullPolicy: $worker_policy"; fi
sed "s/PULL_POLICY_LINE/$line/" "$here/worker-$template.yaml" > /tmp/worker-pod.json
kubectl -n cmwa create configmap worker-template --from-file=worker-pod.json=/tmp/worker-pod.json --dry-run=client -o yaml | kubectl apply -f -
kubectl -n cmwa create configmap agent-settings --from-literal=PULUMI_AGENT_IMAGE_PULL_POLICY="$agent_policy" --dry-run=client -o yaml | kubectl apply -f -
kubectl -n cmwa rollout restart deployment/workflow-agent-pool
kubectl -n cmwa rollout status deployment/workflow-agent-pool --timeout=180s
echo "configured template=$template agent_policy=$agent_policy worker_policy=$worker_policy"
