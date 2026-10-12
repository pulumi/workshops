#!/usr/bin/env bash
# Step 9: send requests to the service. Without arguments the requests succeed.
# With "fail" every request sets the failure switch of the echo image
# (x-set-response-status-code=500), so the service answers 500.
# Usage: ./send-requests.sh <service-url> [fail] [count]
set -euo pipefail
# shellcheck source=../00-setup/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../00-setup/lib.sh"

require curl

url="${1:?usage: send-requests.sh <service-url> [fail] [count]}"
mode="${2:-ok}"
count="${3:-200}"

query=""
if [ "$mode" = "fail" ]; then
  query="?x-set-response-status-code=500"
fi

for _ in $(seq 1 "$count"); do
  curl -s -o /dev/null -w "%{http_code}\n" "${url}${query}"
done | sort | uniq -c
