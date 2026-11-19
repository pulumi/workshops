#!/usr/bin/env bash
# ssh.sh — SSH to the demo VM through the NodePort Service 04-vm creates
# (its stack exports `nodePort`).
#
#   05-console/ssh.sh                 # discover the NodePort from the cluster
#   05-console/ssh.sh 30022           # use this port instead of discovering it
#
# kind maps every Service NodePort onto every node's own IP by default — this
# is standard kind networking, not anything specific to KubeVirt — so we only
# need any one node's InternalIP plus the NodePort.
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

have kubectl || die "kubectl is not installed or not on PATH"

node_port="${1:-}"
if [ -z "$node_port" ]; then
  node_port="$(kubectl get svc demo-vm-ssh -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)"
fi
[ -n "$node_port" ] || die "could not discover the NodePort for Service 'demo-vm-ssh' — pass it explicitly as \$1, or check 'kubectl get svc demo-vm-ssh'"

node_ip="$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null)"
[ -n "$node_ip" ] || die "could not discover a node InternalIP — check 'kubectl get nodes -o wide'"

say "connecting to $node_ip:$node_port (demo-vm-ssh NodePort)"
exec ssh "$node_ip" -p "$node_port"
