#!/usr/bin/env bash
# traffic.sh — steady traffic for the scale and upgrade moments: N messages (default 300), 5 per second,
# acks=all. Run it in a second terminal, then run check.sh with the same N once it finishes.
#   05-day2/traffic.sh [count]
set -uo pipefail
# shellcheck source=../04-clients/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../04-clients/lib.sh"
need_cluster
count="${1:-300}"
say "sending $count messages at 5/s (about $((count / 5)) s)"
for i in $(seq 1 "$count"); do
  echo "t-$i"
  sleep 0.2
done | kafka_exec "$KAFKA_BIN/kafka-console-producer.sh" \
  --bootstrap-server "$BOOTSTRAP" --topic "$TOPIC" \
  --producer-property acks=all --producer-property retries=2147483647 \
  --producer-property delivery.timeout.ms=300000
say "traffic finished"
