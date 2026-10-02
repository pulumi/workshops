#!/usr/bin/env bash
# cluster-up.sh: create the 3-worker kind cluster and prepare every node for Longhorn.
#
#   01-cluster/scripts/cluster-up.sh
#
# Longhorn attaches volumes through iSCSI, so each node needs open-iscsi with a
# running iscsid (and nfs-common for ReadWriteMany volumes). The kind node image
# does not ship them. The host kernel must also provide the iscsi_tcp module,
# because kind nodes share the host kernel.
set -euo pipefail

CLUSTER=storage-workshop
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if kind get clusters 2>/dev/null | grep -qx "$CLUSTER"; then
  echo "cluster $CLUSTER already exists, reusing it"
else
  kind create cluster --config "$HERE/../kind.yaml"
fi

# The host kernel module cannot be loaded from inside a container on every
# platform, so this is best effort. Longhorn reports the problem if it is missing.
if ! lsmod 2>/dev/null | grep -q '^iscsi_tcp'; then
  echo "note: iscsi_tcp is not loaded on this host; trying 'sudo modprobe iscsi_tcp'" >&2
  sudo -n modprobe iscsi_tcp 2>/dev/null || echo "warning: could not load iscsi_tcp, run it on the Docker host" >&2
fi

for node in $(kind get nodes --name "$CLUSTER"); do
  echo "preparing $node"
  docker exec "$node" bash -c '
    set -e
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq open-iscsi nfs-common
    systemctl enable --now iscsid
  '
done

kubectl --context "kind-$CLUSTER" get nodes
