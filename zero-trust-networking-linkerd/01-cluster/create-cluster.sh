#!/usr/bin/env bash
# create-cluster.sh — presenter setup, run before the session (step 1).
#
#   01-cluster/create-cluster.sh
#
# Creates a local single-node Kubernetes cluster with kind, pinned to the
# node image this folder was tested against. Not part of the live demo: do
# this in advance so image pulls do not eat the 90-minute budget.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLUSTER="${MESH_DEMO_CLUSTER:-mesh-demo}"
NODE_IMAGE="${MESH_DEMO_NODE_IMAGE:-kindest/node:v1.37.0@sha256:a1ed56cfb0e7b93589bdf97c8cd566405a265939e3620fc4f5de89adff580ae5}"

command -v kind >/dev/null 2>&1 || { echo "ERROR: kind not installed (https://kind.sigs.k8s.io/)" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not installed or not running" >&2; exit 1; }

if kind get clusters 2>/dev/null | grep -qx "$CLUSTER"; then
  echo "kind cluster '$CLUSTER' already exists; delete it first with:"
  echo "  kind delete cluster --name $CLUSTER"
  exit 0
fi

echo "creating kind cluster '$CLUSTER' (node image: $NODE_IMAGE)"
kind create cluster --name "$CLUSTER" --image "$NODE_IMAGE" --config "$DIR/kind-config.yaml"

echo
echo "cluster context: kind-$CLUSTER"
kubectl --context "kind-$CLUSTER" get nodes
