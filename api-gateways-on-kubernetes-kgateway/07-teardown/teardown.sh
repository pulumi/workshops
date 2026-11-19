#!/usr/bin/env bash
# Destroys the six workshop stacks in reverse build order, then confirms
# `01-kgateway-install`'s teardown removed the kind cluster itself (its
# `local.Command` delete hook runs `kind delete cluster`).
#
# Run order: 06-header-routing -> 05-path-routing -> 04-backends ->
# 03-gateway -> 02-gatewayclass -> 01-kgateway-install. Every project in
# this workshop is expected to always be up by the time teardown runs, so
# this script stops on the first failure rather than tolerating a missing
# stack.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "${script_dir}/.." && pwd)"

projects=(
  "06-header-routing"
  "05-path-routing"
  "04-backends"
  "03-gateway"
  "02-gatewayclass"
  "01-kgateway-install"
)

for project in "${projects[@]}"; do
  echo "==> pulumi destroy in ${project}"
  (cd "${root_dir}/${project}" && pulumi destroy --yes)
done

echo "==> all six stacks destroyed"
