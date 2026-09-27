#!/usr/bin/env bash
# scale-brokers.sh — scale the broker KafkaNodePool live and watch a new
# broker join with no consumer disruption.
#
#   05-scale-brokers/scale-brokers.sh [target-replicas]
#
# Runs `pulumi config set` against the 02-kafka stack to change
# `brokerReplicas`, then `pulumi up` against that same stack. Strimzi's
# Cluster Operator reconciles the new replica count on the `broker`
# KafkaNodePool: a new broker pod comes up, joins the cluster, and existing
# partitions may rebalance onto it depending on Cruise Control / manual
# reassignment (out of scope for this workshop — the point here is the
# broker joining and staying healthy, not partition rebalancing).
#
# Point the audience at 04-clients' consumer logs (already tailing
# demo-events) while this runs: message flow should not pause.
#
# Command syntax confirmed against strimzi.io/docs/operators/latest/deploying
# (2026-09-27): brokerReplicas is a Pulumi config value read by
# 02-kafka/index.ts; there is no separate Strimzi CLI for this, only editing
# the KafkaNodePool's spec.replicas, which is exactly what `pulumi up` does.
set -euo pipefail

TARGET_REPLICAS="${1:-4}"
KAFKA_STACK_DIR="${KAFKA_STACK_DIR:-../02-kafka}"
KUBE_CONTEXT="${KUBE_CONTEXT:-kind-kafka-workshop-demo}"
NAMESPACE="${NAMESPACE:-kafka}"
POLL_SECONDS="${POLL_SECONDS:-3}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-180}"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

say "scaling broker node pool to $TARGET_REPLICAS replicas"
say "before: watch 04-clients' consumer logs — messages should keep flowing throughout"

pulumi config set brokerReplicas "$TARGET_REPLICAS" --cwd "$KAFKA_STACK_DIR"
pulumi up --yes --cwd "$KAFKA_STACK_DIR"

say "waiting up to ${TIMEOUT_SECONDS}s for $TARGET_REPLICAS broker pods to report Running"

elapsed=0
running_count=0
while [ "$elapsed" -lt "$TIMEOUT_SECONDS" ]; do
  running_count="$(kubectl get pods -n "$NAMESPACE" --context "$KUBE_CONTEXT" \
    -l strimzi.io/cluster=demo-cluster,strimzi.io/pool-name=broker \
    --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$running_count" -ge "$TARGET_REPLICAS" ]; then
    break
  fi
  printf '.'
  sleep "$POLL_SECONDS"
  elapsed=$((elapsed + POLL_SECONDS))
done
printf '\n'

if [ "$running_count" -ge "$TARGET_REPLICAS" ]; then
  say "scale complete: $running_count broker pods Running (after ~${elapsed}s)"
  say "confirm no gap in 04-clients' consumer logs, then run 'kubectl get kafka demo-cluster -n $NAMESPACE --context $KUBE_CONTEXT' to see the cluster still Ready"
else
  die "only $running_count/$TARGET_REPLICAS broker pods Running after ${TIMEOUT_SECONDS}s — run 'kubectl get pods -n $NAMESPACE --context $KUBE_CONTEXT -l strimzi.io/cluster=demo-cluster' by hand to see what is happening"
fi
