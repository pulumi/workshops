#!/usr/bin/env bash
# build.sh — demo step 2: build the demo image locally.
#
#   02-image/build.sh
#
# Builds the image once, tagged `local/hello:demo`. 03-sign-and-push/ and
# 04-unsigned-image/ both push this same build to ECR, one signed and one not
# — they do not rebuild it.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

have docker || die "docker not found"

IMAGE="local/hello:demo"

say "Building ${IMAGE}"
docker build -t "$IMAGE" "$DIR"

note "built ${IMAGE}"
