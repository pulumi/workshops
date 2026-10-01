#!/usr/bin/env bash
# teardown.sh — tear the demo down in dependency order: the VM first, then
# KubeVirt, then the cluster itself. Stops at the first failure rather than
# plowing on, since a partial teardown left running is something to
# investigate, not paper over.
#
#   07-teardown/teardown.sh
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

destroy_stack() {
  local dir="$1"
  say "pulumi destroy --stack dev --yes in $dir"
  (cd "$dir" && pulumi destroy --stack dev --yes) || die "pulumi destroy failed in $dir — investigate before tearing down the rest"
}

destroy_stack "$here/../04-vm"
destroy_stack "$here/../03-kubevirt"
destroy_stack "$here/../02-cluster"

say "teardown complete"
