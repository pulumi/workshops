#!/usr/bin/env bash
# teardown.sh — tear the demo down in the reverse of build order:
# 04-clients -> 03-topic -> 02-kafka -> 01-cluster. That last destroy also
# deletes the kind cluster itself via the `local.Command` delete hook in
# 01-cluster, so it has to run after everything that depends on the
# cluster still existing.
#
#   07-teardown/teardown.sh
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ctx="kind-kafka-workshop-demo"
ns="kafka"

echo "== teardown: kafka-on-kubernetes-strimzi =="
echo "order: 04-clients -> 03-topic -> 02-kafka -> 01-cluster"
echo

echo "-- 04-clients --"
pulumi destroy --yes --cwd "$here/../04-clients" --stack dev
echo

echo "-- 03-topic --"
pulumi destroy --yes --cwd "$here/../03-topic" --stack dev
echo

echo "-- 02-kafka --"
pulumi destroy --yes --cwd "$here/../02-kafka" --stack dev
echo

# --- Verify PVC cleanup before the kind cluster disappears. Every broker
# and controller pod in this workshop uses `storage.type: jbod` with
# `type: persistent-claim` and `deleteClaim: true` (see 02-kafka/index.ts),
# which Strimzi's own docs describe as removing the PVC when the KafkaNodePool
# or Kafka resource is deleted. Check rather than assume anyway — this build
# could not run a live cluster to confirm that behavior directly (see this
# folder's AGENTS.md and the pull request for what remains unverified) — and
# do this now, while the kind cluster from 01 still exists to check against.
echo "-- verifying PVC cleanup (deleteClaim: true is documented, not verified live in this build) --"
leftover_pvcs="$(kubectl get pvc -n "$ns" --context "$ctx" -l strimzi.io/cluster=demo-cluster -o name 2>/dev/null || true)"
if [ -n "$leftover_pvcs" ]; then
  echo "found leftover PVC(s) still bound to a deleted Kafka cluster:"
  while IFS= read -r pvc; do echo "  $pvc"; done <<< "$leftover_pvcs"
  echo "deleting them explicitly:"
  kubectl delete pvc -n "$ns" --context "$ctx" -l strimzi.io/cluster=demo-cluster
else
  echo "none found: no strimzi.io/cluster-labeled PVCs remain in $ns"
fi
echo

echo "-- 01-cluster (also deletes the kind cluster via its delete hook) --"
pulumi destroy --yes --cwd "$here/../01-cluster" --stack dev
echo

echo "== teardown complete =="
