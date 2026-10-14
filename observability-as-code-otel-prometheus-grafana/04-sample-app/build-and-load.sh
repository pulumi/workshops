#!/usr/bin/env bash
# Builds the sample app image and loads it directly into the kind cluster
# created in 01-cluster, so 04-sample-app's Deployment can pull it with
# imagePullPolicy: Never -- no registry needed for a local workshop.
set -euo pipefail

# shellcheck source=/dev/null
cd "$(dirname "${BASH_SOURCE[0]}")"

CLUSTER_NAME="${CLUSTER_NAME:-observability-workshop}"
IMAGE="${IMAGE:-observability-sample-app:dev}"

echo "Building ${IMAGE} from app/ ..."
docker build -t "${IMAGE}" app/

echo "Loading ${IMAGE} into kind cluster ${CLUSTER_NAME} ..."
kind load docker-image "${IMAGE}" --name "${CLUSTER_NAME}"

echo "Done. Set config observability-sample-app:image=${IMAGE} to match."
