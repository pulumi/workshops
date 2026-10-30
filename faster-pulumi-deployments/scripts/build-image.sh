#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
language="${1:?Usage: build-image.sh typescript|python|go|dotnet|java}"
case "$language" in
    typescript) runtime=node:22-bookworm-slim ;;
    python) runtime=python:3.12-slim-bookworm ;;
    go) runtime=golang:1.25-bookworm ;;
    dotnet) runtime=mcr.microsoft.com/dotnet/sdk:8.0 ;;
    java) runtime=maven:3.9.9-eclipse-temurin-17 ;;
    *) exit 2 ;;
esac
target="${IMAGE_TARGET:-runtime}"
case "$target" in runtime|artifact-runner) ;; *) exit 2 ;; esac
tag="$language"
if [ "$target" = artifact-runner ]; then tag="$language-tools"; fi
docker buildx build --load --platform "${PLATFORM:-linux/amd64}" \
    --build-arg "RUNTIME_IMAGE=${RUNTIME_IMAGE:-$runtime}" \
    --build-arg "PULUMI_VERSION=${PULUMI_VERSION:-3.259.0}" \
    --build-arg "LANGUAGE=$language" \
    --target "$target" \
    --tag "${IMAGE:-faster-pulumi-deployments:$tag}" \
    --file "$root/images/Dockerfile" "$root"
if [ "$target" = runtime ]; then
    config="$root/workspaces/image/$language"
    mkdir -p "$config"
    cp "$root/programs/$language/Pulumi.image.yaml" "$config/Pulumi.yaml"
    printf 'External project configuration: %s\n' "$config"
fi
