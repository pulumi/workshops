#!/usr/bin/env bash
# simulate-failure.sh: take the node that hosts the app pod out of service and
# check that the record survives on another node.
#
#   05-node-failure/simulate-failure.sh            # cordon the node, delete the pod
#   05-node-failure/simulate-failure.sh --drain    # cordon and drain the node instead
#
# Waiting for the new pod is capped at 2 attempts (the workshop's fallback rule:
# after two tries, switch to the recording). Run restore-node.sh afterwards.
set -euo pipefail

NS="${NS:-demo}"
CTX="${CTX:-kind-storage-workshop}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
k() { kubectl --context "$CTX" "$@"; }

old_node="$(k -n "$NS" get pod -l app=record-keeper -o jsonpath='{.items[0].spec.nodeName}')"
old_pod="$(k -n "$NS" get pod -l app=record-keeper -o jsonpath='{.items[0].metadata.name}')"
echo "pod $old_pod runs on $old_node"
echo "$old_node" > "$HERE/.failed-node"

k cordon "$old_node"
if [[ "${1:-}" == "--drain" ]]; then
  k drain "$old_node" --ignore-daemonsets --delete-emptydir-data --timeout=120s
else
  k -n "$NS" delete pod "$old_pod" --wait=true
fi

attempt=1
max_attempts=2
while true; do
  if k -n "$NS" rollout status deploy/record-keeper --timeout=180s; then
    break
  fi
  if (( attempt >= max_attempts )); then
    echo "pod did not become ready after $max_attempts attempts; switch to the recording" >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  echo "attempt $attempt of $max_attempts"
done

new_node="$(k -n "$NS" get pod -l app=record-keeper -o jsonpath='{.items[0].spec.nodeName}')"
echo "pod now runs on $new_node"
if [[ "$new_node" == "$old_node" ]]; then
  echo "pod landed on the same node, the failure was not simulated" >&2
  exit 1
fi

echo -n "record after failover: "
k -n "$NS" exec deploy/record-keeper -- cat /data/record.txt
