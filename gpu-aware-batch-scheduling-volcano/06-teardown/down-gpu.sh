#!/usr/bin/env bash
# down-gpu.sh — tear down 05-gpu-dra (the EKS cluster and its GPU node
# group). This is the highest-cost resource in the workshop: run this the
# moment the GPU segment is rehearsed or delivered, live or not.
#
#   06-teardown/down-gpu.sh
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

destroy_project "05-gpu-dra"

say "confirming the GPU node group is gone"
note "verify: aws eks list-nodegroups --cluster-name gpu-batch-dra"
note "        (expect an empty list, or a ResourceNotFoundException once the cluster itself is gone)"
