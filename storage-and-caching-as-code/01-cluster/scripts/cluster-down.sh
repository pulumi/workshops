#!/usr/bin/env bash
# cluster-down.sh: delete the kind cluster. Run the pulumi destroy steps first.
set -euo pipefail
kind delete cluster --name storage-workshop
