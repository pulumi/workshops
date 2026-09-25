#!/usr/bin/env bash
# wait-for-kyverno.sh — run before `pulumi up` in this folder.
#
#   03-cluster-policy/wait-for-kyverno.sh && pulumi up
#
# 02-kyverno's `pulumi up` returns as soon as the Kubernetes API accepts the
# admission-controller Deployment; the webhook itself can take a few more
# seconds to come up and register with the API server. Applying the
# ClusterPolicy before that finishes can race the webhook (brief risk:
# "Kyverno webhook not yet ready when the ClusterPolicy is applied"). This
# script is that wait, so the fallback in the brief (a 30-second pause slide)
# is never needed live.
set -euo pipefail
CLUSTER="${POLICY_DEMO_CLUSTER:-policy-demo}"
CONTEXT="kind-$CLUSTER"

echo "waiting for Kyverno's admission-controller pods to be Ready..."
kubectl --context "$CONTEXT" wait --for=condition=Ready pods \
  -l app.kubernetes.io/component=admission-controller \
  -n kyverno --timeout=180s

echo "Kyverno is ready; safe to run 'pulumi up' in 03-cluster-policy"
