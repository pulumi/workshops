#!/usr/bin/env bash
# read-record.sh: read the record back and say which node the pod runs on.
#
#   04-stateful-app/scripts/read-record.sh
set -euo pipefail

NS="${NS:-demo}"
CTX="${CTX:-kind-storage-workshop}"

node="$(kubectl --context "$CTX" -n "$NS" get pod -l app=record-keeper -o jsonpath='{.items[0].spec.nodeName}')"
echo "pod runs on: ${node}"
echo -n "record: "
kubectl --context "$CTX" -n "$NS" exec deploy/record-keeper -- cat /data/record.txt
