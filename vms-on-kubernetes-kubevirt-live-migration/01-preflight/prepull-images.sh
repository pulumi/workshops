#!/usr/bin/env bash
# prepull-images.sh — pull every image the demo needs ahead of the session,
# so there is no live download delay in front of an audience.
#
#   01-preflight/prepull-images.sh                 # host Docker cache
#   01-preflight/prepull-images.sh vms-workshop-demo   # also into every kind node
#
# The kind nodes run their own containerd, so images pulled on the host do
# not reach them. Run the second form after 02-cluster has created the
# cluster: it pulls each image inside every node with `crictl`.
set -uo pipefail
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

have docker || die "docker is not installed or not on PATH"

cluster="${1:-}"

# Image refs: the KubeVirt images are pinned to the v1.9.0 release tag
# (virt-operator is named in kubevirt-operator.yaml; the operator derives the
# other four from the same tag). The cirros containerDisk is pinned by the
# digest of its multi-arch index, the same value 04-vm/index.ts uses.
images=(
  "quay.io/kubevirt/virt-operator:v1.9.0"
  "quay.io/kubevirt/virt-api:v1.9.0"
  "quay.io/kubevirt/virt-controller:v1.9.0"
  "quay.io/kubevirt/virt-handler:v1.9.0"
  "quay.io/kubevirt/virt-launcher:v1.9.0"
  "quay.io/kubevirt/cirros-container-disk-demo@sha256:2e74c8b8ebeb2384382c02e64c16667340d09c002664fd04ab74b7f1d01e0c62"
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

if [ -n "$cluster" ]; then
  nodes="$(kind get nodes --name "$cluster" 2>/dev/null || true)"
  [ -n "$nodes" ] || die "no kind nodes found for cluster '$cluster' (kind get nodes --name $cluster)"
  for node in $nodes; do
    for img in "${images[@]}"; do
      say "pulling $img inside $node"
      if docker exec "$node" crictl pull "$img" >/dev/null; then
        say "OK: $node $img"
      else
        say "FAILED: $node $img"
        failed+=("$node:$img")
      fi
    done
  done
fi

if [ "${#failed[@]}" -gt 0 ]; then
  die "failed to pull ${#failed[@]} image(s): ${failed[*]}"
fi

say "all images pulled"
