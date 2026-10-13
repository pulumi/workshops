#!/usr/bin/env bash
# push-unsigned.sh — demo step 5: push a second, unsigned variant of the same
# demo image, so 06-reject-unsigned/ has something for Kyverno to refuse.
#
#   04-unsigned-image/push-unsigned.sh
#
# Needs 02-image/build.sh already run, and the platform already up (for the
# ECR repository URL).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

have docker || die "docker not found"
have aws || die "aws CLI not found"

REPO_URL="$(pulumi stack output repositoryUrl --cwd "$DIR/../01-platform")"
[[ -n "$REPO_URL" ]] || die "could not read repositoryUrl from 01-platform's stack; did you run pulumi up there?"

IMAGE="${REPO_URL}:unsigned"

say "Logging in to ECR"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${REPO_URL%%/*}"

say "Tagging local/hello:demo as ${IMAGE}"
docker tag local/hello:demo "$IMAGE"

say "Pushing ${IMAGE} — deliberately never signed"
docker push "$IMAGE"

note "unsigned image ready: ${IMAGE}"
