#!/usr/bin/env bash
# produce.sh — send N numbered messages (default 100) to demo-events from the client pod.
#   04-clients/produce.sh [count]
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need_cluster
count="${1:-100}"
say "producing $count messages to $TOPIC"
seq 1 "$count" | sed 's/^/demo-/' |
  kafka_exec "$KAFKA_BIN/kafka-console-producer.sh" \
    --bootstrap-server "$BOOTSTRAP" --topic "$TOPIC" --producer-property acks=all
say "done: $count messages sent"
