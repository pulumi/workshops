#!/usr/bin/env bash
# check-dra.sh — what DRA looks like on this cluster: the resource.k8s.io API and any published devices.
# kind has no GPU and no GPU driver, so the ResourceSlice list is empty here. That is the point
# of the recorded segment in the README: fractional sharing needs a real GPU and a DRA driver.
#   04-dra/check-dra.sh
set -uo pipefail
# shellcheck source=../lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need_cluster
say "resource.k8s.io API group served by this cluster"
kubectl api-resources --api-group=resource.k8s.io
say "device classes"
kubectl get deviceclasses.resource.k8s.io 2>&1
say "resource slices (devices published by DRA drivers)"
kubectl get resourceslices.resource.k8s.io 2>&1
