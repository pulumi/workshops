#!/usr/bin/env bash
# roundtrip.sh: run the client Job against Dragonfly and print what it read back.
#
#   07-cache-client/roundtrip.sh
set -euo pipefail

CTX="${CTX:-kind-storage-workshop}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
k() { kubectl --context "$CTX" -n demo "$@"; }

k delete job cache-client --ignore-not-found
k apply -f "$HERE/job.yaml"
k wait --for=condition=complete job/cache-client --timeout=120s
k logs job/cache-client
