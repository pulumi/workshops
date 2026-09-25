#!/usr/bin/env bash
# try-apply.sh — step 5, live: attempt to create a Pod with no resource
# limits and show it rejected at admission time.
#
#   04-admission-denied/try-apply.sh
#
# Expected end state (brief step 5): the apply is rejected with a Kyverno
# admission error naming the require-resource-limits policy. This script
# fails on purpose when Kyverno is doing its job — its own exit code is not
# the interesting result, the printed error is, so read the output rather
# than trusting a green/red exit status.
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER="${POLICY_DEMO_CLUSTER:-policy-demo}"
CONTEXT="kind-$CLUSTER"

echo "applying unsafe-pod.yaml (no resources.limits) against $CONTEXT..."
echo
kubectl --context "$CONTEXT" apply -f "$DIR/unsafe-pod.yaml"
status=$?

echo
if [ "$status" -ne 0 ]; then
  echo "rejected as expected: Kyverno's admission webhook blocked the request."
else
  echo "WARNING: the apply succeeded. require-resource-limits is not enforcing;" >&2
  echo "check 'kubectl get clusterpolicy require-resource-limits -o yaml' and" >&2
  echo "confirm 03-cluster-policy's stack is up." >&2
fi
exit 0
