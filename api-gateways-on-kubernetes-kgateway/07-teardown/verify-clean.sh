#!/usr/bin/env bash
# Confirms no `api-gateways-workshop-demo` kind cluster remains after
# `teardown.sh` runs. `01-kgateway-install`'s destroy step runs
# `kind delete cluster` as part of its `local.Command` delete hook, so this
# is a check on that hook actually having worked, not a teardown step of
# its own.
set -euo pipefail

cluster_name="api-gateways-workshop-demo"

if ! command -v kind >/dev/null 2>&1; then
  echo "FAIL: kind is not installed, cannot verify"
  exit 1
fi

clusters="$(kind get clusters 2>/dev/null || true)"
if echo "${clusters}" | grep -qx "${cluster_name}"; then
  echo "FAIL: kind still lists cluster '${cluster_name}'"
  echo "remove it manually with: kind delete cluster --name ${cluster_name}"
  exit 1
fi

echo "PASS: no '${cluster_name}' kind cluster remains"
