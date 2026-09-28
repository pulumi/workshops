#!/usr/bin/env bash
# The 20-minute live failover demo (brief section 1's promised outcome):
# cordon and drain the node running the record-writer pod, watch it
# reschedule onto a different worker, and confirm the records written
# before the drain are still on the volume.
#
# Idempotent and re-runnable: if a previous run left a node cordoned (a
# failed drill, or a presenter re-running it), this script uncordons every
# node first rather than assuming a clean starting state. Brief section 7's
# risk note caps this at two live retries in the room before falling back
# to the presenter's recording -- that cap is a presenter judgment call,
# not something this script enforces, since a script cannot know whether a
# given failure is worth retrying live.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source ./lib.sh

echo "== 0. Idempotency: uncordon every node before starting =="
for node in $(k get nodes -o jsonpath='{.items[*].metadata.name}'); do
    k uncordon "$node" >/dev/null 2>&1 || true
done

echo "== 1. Locate the record-writer pod and its node =="
before_node="$(current_node)"
if [[ -z "$before_node" ]]; then
    echo "No record-writer pod found. Run 'pulumi up' in 04-stateful-app first." >&2
    exit 1
fi
before_pod="$(current_pod)"
echo "record-writer is on node: $before_node (pod: $before_pod)"

echo "== 2. Capture the record file before the drain =="
before_lines="$(k -n "$NAMESPACE" exec "$before_pod" -- wc -l "$RECORD_FILE" | awk '{print $1}')"
echo "Records written so far: $before_lines"
k -n "$NAMESPACE" exec "$before_pod" -- tail -n 3 "$RECORD_FILE"

echo "== 3. Cordon and drain $before_node =="
k cordon "$before_node"
k drain "$before_node" \
    --ignore-daemonsets \
    --delete-emptydir-data \
    --force \
    --timeout=120s

echo "== 4. Wait for the pod to reschedule and become Ready =="
k -n "$NAMESPACE" rollout status deployment/"$DEPLOYMENT" --timeout=120s

after_node="$(current_node)"
after_pod="$(current_pod)"
echo "record-writer is now on node: $after_node (pod: $after_pod)"
if [[ "$after_node" == "$before_node" ]]; then
    echo "WARNING: pod rescheduled onto the same node; the drain may not have evicted it as expected." >&2
fi

echo "== 5. Verify the pre-drain records survived on the new pod =="
after_lines="$(k -n "$NAMESPACE" exec "$after_pod" -- wc -l "$RECORD_FILE" | awk '{print $1}')"
echo "Records now on file: $after_lines"
if (( after_lines < before_lines )); then
    echo "FAIL: record count went backwards ($before_lines -> $after_lines). Data was lost." >&2
    exit 1
fi
echo "PASS: all $before_lines pre-drain records are present, $((after_lines - before_lines)) more were written after reschedule."
k -n "$NAMESPACE" exec "$after_pod" -- head -n 3 "$RECORD_FILE"

echo "== 6. Uncordon $before_node =="
k uncordon "$before_node"

echo "Drill complete."
