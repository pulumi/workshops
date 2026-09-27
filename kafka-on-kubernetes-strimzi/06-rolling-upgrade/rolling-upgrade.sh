#!/usr/bin/env bash
# rolling-upgrade.sh — bump the Kafka version live and watch Strimzi roll
# brokers and controllers one at a time, with no message loss.
#
#   06-rolling-upgrade/rolling-upgrade.sh
#
# Strimzi's own upgrade procedure for a KRaft cluster is two sequential
# config changes, not one (strimzi.io/docs/operators/latest/deploying,
# section "Upgrading Kafka", read 2026-09-27):
#   1. Change `Kafka.spec.kafka.version`, LEAVING `metadataVersion` at the
#      OLD default. This starts the rolling restart: brokers pick up the
#      new binaries one at a time while old and new binaries coexist and
#      metadataVersion stays put so every node can still talk to every
#      other node mid-roll.
#   2. Once every pod is back on the new version, update
#      `metadataVersion` to the new version's default. This is a second,
#      much faster rolling restart (or no restart at all, depending on the
#      versions involved).
# This script runs both steps, waiting for the roll to settle in between,
# so it matches that procedure exactly rather than changing both fields in
# one `pulumi up` (which the docs do not present as a supported path for
# a live cluster).
#
# This build ships one move: 4.2.1 (metadataVersion 4.2-IV1) to
# 4.3.1 (metadataVersion 4.3-IV0), both supported by Strimzi 1.2.0.
set -euo pipefail

NEW_KAFKA_VERSION="${1:-4.3.1}"
NEW_METADATA_VERSION="${2:-4.3-IV0}"
KAFKA_STACK_DIR="${KAFKA_STACK_DIR:-../02-kafka}"
KUBE_CONTEXT="${KUBE_CONTEXT:-kind-kafka-workshop-demo}"
NAMESPACE="${NAMESPACE:-kafka}"
POLL_SECONDS="${POLL_SECONDS:-5}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-300}"

say() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

wait_for_ready() {
  local label="$1"
  local elapsed=0
  local ready=""
  while [ "$elapsed" -lt "$TIMEOUT_SECONDS" ]; do
    ready="$(kubectl get kafka demo-cluster -n "$NAMESPACE" --context "$KUBE_CONTEXT" \
      -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || true)"
    if [ "$ready" = "True" ]; then
      say "$label: Kafka resource reports Ready=True (after ~${elapsed}s)"
      return 0
    fi
    printf '.'
    sleep "$POLL_SECONDS"
    elapsed=$((elapsed + POLL_SECONDS))
  done
  die "$label: Kafka resource did not report Ready=True within ${TIMEOUT_SECONDS}s — run 'kubectl get kafka demo-cluster -n $NAMESPACE --context $KUBE_CONTEXT -o yaml' by hand to see what is happening"
}

say "step 1/2: upgrading kafka.version to $NEW_KAFKA_VERSION (metadataVersion unchanged)"
say "before: watch 04-clients' consumer logs — messages should keep flowing through each broker's restart"
pulumi config set kafkaVersion "$NEW_KAFKA_VERSION" --cwd "$KAFKA_STACK_DIR"
pulumi up --yes --cwd "$KAFKA_STACK_DIR"
wait_for_ready "step 1/2"

say "step 2/2: upgrading metadataVersion to $NEW_METADATA_VERSION"
pulumi config set metadataVersion "$NEW_METADATA_VERSION" --cwd "$KAFKA_STACK_DIR"
pulumi up --yes --cwd "$KAFKA_STACK_DIR"
wait_for_ready "step 2/2"

say "rolling upgrade complete: Kafka $NEW_KAFKA_VERSION, metadataVersion $NEW_METADATA_VERSION"
say "confirm no gap in 04-clients' consumer logs across both restarts"
