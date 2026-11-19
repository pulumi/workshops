#!/usr/bin/env bash
# upgrade.sh — step 6: bump the Kafka version on the Kafka resource; Strimzi rolls the pods one at a time.
#   05-day2/upgrade.sh [version]   # default 4.3.1
set -uo pipefail
# shellcheck source=../04-clients/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../04-clients/lib.sh"
need_cluster
have pulumi || die "pulumi not installed"
version="${1:-4.3.1}"
cd "$WORKSHOP_DIR/02-kafka" || exit 1

say "pulumi config set kafkaVersion $version"
pulumi config set kafkaVersion "$version" --stack "$STACK"
say "pulumi up (the rolling restart takes several minutes; watch the pods in another terminal)"
pulumi up --yes --stack "$STACK" || die "pulumi up failed"

say "Kafka resource and pods"
kubectl -n "$NS" get kafka "$CLUSTER" -o jsonpath='{.status.kafkaVersion}{"\n"}'
kubectl -n "$NS" get pods -l strimzi.io/cluster="$CLUSTER"
