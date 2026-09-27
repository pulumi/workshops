#!/usr/bin/env bash
# down.sh — tear down the kind-based steps (01-04), in reverse dependency
# order, then delete the kind cluster itself.
#
#   06-teardown/down.sh
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

for project in 04-fair-share 03-gang-scheduling 02-queues; do
  destroy_project "$project"
done

say "deleting the kind cluster (01-cluster's local.Command delete path)"
destroy_project "01-cluster"

note "verify: kind get clusters   # should no longer list gpu-batch-demo"
