#!/usr/bin/env bash
# Build and push the ADK + Vertex AI agent image used by the GKE workshop.
# Source: Google's official ADK tutorial app under
# kubernetes-engine-samples/ai-ml/adk-vertex (capital_agent demo).
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/app"

REGISTRY="${REGISTRY:-ghcr.io/dirien}"
IMAGE="${IMAGE:-adk-agent}"
TAG="${TAG:-latest}"
PLATFORM="${PLATFORM:-linux/amd64}"

FULL="${REGISTRY}/${IMAGE}:${TAG}"

echo "Image: ${FULL}"
echo "Arch:  ${PLATFORM}"

docker buildx build \
  --platform "${PLATFORM}" \
  --tag "${FULL}" \
  --push \
  .

echo
echo "Pushed: ${FULL}"
echo
echo "Make sure the package is public:"
echo "  https://github.com/users/dirien/packages/container/${IMAGE}/settings"
