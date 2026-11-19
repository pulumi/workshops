#!/usr/bin/env bash
# consume.sh — read demo-events from the beginning; stop after 15 s without new messages.
# Shows partition and offset: Kafka orders messages per partition, not across the topic.
#   04-clients/consume.sh
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need_cluster
say "consuming $TOPIC from the beginning"
kafka_exec "$KAFKA_BIN/kafka-console-consumer.sh" \
  --bootstrap-server "$BOOTSTRAP" --topic "$TOPIC" --from-beginning --timeout-ms 15000 \
  --property print.partition=true --property print.offset=true 2>&1 | grep -v '^Processed a total'
