#!/usr/bin/env bash
# write-record.sh: write one record to the Longhorn volume through the running pod.
#
#   04-stateful-app/scripts/write-record.sh [text]
set -euo pipefail

NS="${NS:-demo}"
CTX="${CTX:-kind-storage-workshop}"
TEXT="${1:-hello from Longhorn}"

node="$(kubectl --context "$CTX" -n "$NS" get pod -l app=record-keeper -o jsonpath='{.items[0].spec.nodeName}')"
record="$(date -u +%Y-%m-%dT%H:%M:%SZ) | written on ${node} | ${TEXT}"

kubectl --context "$CTX" -n "$NS" exec deploy/record-keeper -- \
  sh -c "echo '${record}' > /data/record.txt && sync"
echo "wrote: ${record}"
