#!/usr/bin/env bash
# restore-node.sh: uncordon the node that simulate-failure.sh took out of service.
#
#   05-node-failure/restore-node.sh
set -euo pipefail

CTX="${CTX:-kind-storage-workshop}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node="$(cat "$HERE/.failed-node")"
kubectl --context "$CTX" uncordon "$node"
rm -f "$HERE/.failed-node"
