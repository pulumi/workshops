#!/usr/bin/env bash
# scale.sh — step 5: add a broker with a Pulumi config change, then move partitions onto it.
#   05-day2/scale.sh [brokers]     # default 4
# Pulumi scales the KafkaNodePool; Strimzi does not move existing partitions on its own, so the
# script applies a KafkaRebalance in add-brokers mode (Cruise Control) and approves its proposal.
set -uo pipefail
# shellcheck source=../04-clients/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../04-clients/lib.sh"
need_cluster
have pulumi || die "pulumi not installed"
brokers="${1:-4}"
cd "$WORKSHOP_DIR/02-kafka" || exit 1

say "pulumi config set brokerReplicas $brokers"
pulumi config set brokerReplicas "$brokers" --stack "$STACK"
pulumi up --yes --stack "$STACK" || die "pulumi up failed"

say "broker pods"
kubectl -n "$NS" get pods -l strimzi.io/pool-name=broker
new_id="$(kubectl -n "$NS" get pods -l strimzi.io/pool-name=broker -o name |
  sed 's/.*-//' | sort -n | tail -1)"

say "rebalancing partitions onto broker $new_id"
kubectl -n "$NS" apply -f - <<EOF
apiVersion: kafka.strimzi.io/v1
kind: KafkaRebalance
metadata:
  name: add-broker-$new_id
  labels:
    strimzi.io/cluster: $CLUSTER
spec:
  mode: add-brokers
  brokers: [$new_id]
EOF
kubectl -n "$NS" wait "kafkarebalance/add-broker-$new_id" --for=condition=ProposalReady --timeout=300s ||
  die "no proposal: see 'kubectl -n $NS describe kafkarebalance add-broker-$new_id'"
kubectl -n "$NS" annotate "kafkarebalance/add-broker-$new_id" strimzi.io/rebalance=approve --overwrite
kubectl -n "$NS" wait "kafkarebalance/add-broker-$new_id" --for=condition=Ready --timeout=600s ||
  die "rebalance did not finish"

say "partition placement"
kafka_exec "$KAFKA_BIN/kafka-topics.sh" --bootstrap-server "$BOOTSTRAP" --describe --topic "$TOPIC"
