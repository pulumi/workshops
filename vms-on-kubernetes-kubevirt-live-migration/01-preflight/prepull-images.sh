#!/usr/bin/env bash
# prepull-images.sh — pull every image the demo needs ahead of the session,
# so there is no live download delay in front of an audience.
#
#   01-preflight/prepull-images.sh
set -uo pipefail
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

have docker || die "docker is not installed or not on PATH"

# Image refs as read from the KubeVirt v1.9.0 release and quay.io as of
# 2026-09-26. The KubeVirt images are pinned to the exact release tag this
# workshop targets. The cirros containerDisk demo image has no official
# pinned tag from the KubeVirt project — reconfirm the tag below against
# https://quay.io/repository/kubevirt/cirros-container-disk-demo before the
# session; `latest` may have moved since this was written.
images=(
  "quay.io/kubevirt/virt-operator:v1.9.0"
  "quay.io/kubevirt/virt-api:v1.9.0"
  "quay.io/kubevirt/virt-controller:v1.9.0"
  "quay.io/kubevirt/virt-handler:v1.9.0"
  "quay.io/kubevirt/virt-launcher:v1.9.0"
  "quay.io/kubevirt/cirros-container-disk-demo:latest"
)

failed=()
for img in "${images[@]}"; do
  say "pulling $img"
  if docker pull "$img"; then
    say "OK: $img"
  else
    say "FAILED: $img"
    failed+=("$img")
  fi
done

if [ "${#failed[@]}" -gt 0 ]; then
  die "failed to pull ${#failed[@]} image(s): ${failed[*]}"
fi

say "all images pulled"
