#!/usr/bin/env bash
# check.sh — prove no message was lost: every t-1 .. t-N from traffic.sh must be in the topic.
#   05-day2/check.sh [count]
set -uo pipefail
# shellcheck source=../04-clients/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../04-clients/lib.sh"
need_cluster
count="${1:-300}"
say "reading $TOPIC and looking for t-1 .. t-$count"
got="$(kafka_exec "$KAFKA_BIN/kafka-console-consumer.sh" \
  --bootstrap-server "$BOOTSTRAP" --topic "$TOPIC" --from-beginning --timeout-ms 20000 2>/dev/null |
  grep -E '^t-[0-9]+$' | sort -u | wc -l | tr -d ' ')"
echo "unique traffic messages found: $got of $count"
[ "$got" -eq "$count" ] || die "messages missing: $((count - got))"
say "no message lost"
