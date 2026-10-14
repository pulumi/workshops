#!/usr/bin/env bash
# ping.sh: PING Dragonfly from inside the cluster with a pinned redis image.
#
#   06-dragonfly/scripts/ping.sh
# Expected output: PONG
set -euo pipefail

NS="${NS:-demo}"
CTX="${CTX:-kind-storage-workshop}"
REDIS_IMAGE="${REDIS_IMAGE:-redis:8.2.10-alpine}"

kubectl --context "$CTX" -n "$NS" run redis-ping --rm -i --restart=Never \
  --image="$REDIS_IMAGE" -- redis-cli -h dragonfly ping
