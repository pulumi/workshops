#!/usr/bin/env bash
# push-and-sign.sh — demo steps 3 and 4: sign the demo image and push it,
# signed, to the provisioned ECR repository.
#
#   03-sign-and-push/push-and-sign.sh
#
# A Notation signature is an OCI artifact attached to the image by digest, so
# the image has to exist in the registry before it can be signed — this
# script pushes first, then signs, even though the brief's demo-step order
# lists signing before pushing (see README's Layout section for why steps 3
# and 4 are grouped here). Needs 00-signing-key/generate.sh already run and
# 02-image/build.sh already run.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

have docker || die "docker not found"
have notation || die "notation CLI not found (expected v${NOTATION_VERSION})"
have aws || die "aws CLI not found"

REPO_URL="$(pulumi stack output repositoryUrl --cwd "$DIR/../01-platform")"
[[ -n "$REPO_URL" ]] || die "could not read repositoryUrl from 01-platform's stack; did you run pulumi up there?"

IMAGE="${REPO_URL}:signed"

say "Logging in to ECR"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${REPO_URL%%/*}"

say "Tagging local/hello:demo as ${IMAGE}"
docker tag local/hello:demo "$IMAGE"

say "Pushing ${IMAGE} (unsigned, so notation has a digest to sign)"
docker push "$IMAGE"

say "Signing ${IMAGE} with the local Notation test key"
notation sign "$IMAGE"

say "Verifying the signature locally"
notation verify "$IMAGE"

note "signed image ready: ${IMAGE}"
