#!/usr/bin/env bash
# teardown.sh — demo step 10: tear everything down.
#
#   08-teardown/teardown.sh
#
# Order matters: images are deleted from ECR before `pulumi destroy`, since a
# tag pushed outside Pulumi's management (every tag this workshop pushes) is
# not always removed by `pulumi destroy` on its own. Local Notation key
# material is removed last, independent of the cloud teardown.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

have aws || die "aws CLI not found"
have pulumi || die "pulumi CLI not found"

PLATFORM_DIR="$DIR/../01-platform"
REPO_URL="$(pulumi stack output repositoryUrl --cwd "$PLATFORM_DIR" 2>/dev/null || true)"

if [[ -n "$REPO_URL" ]]; then
  REPO_NAME="${REPO_URL#*/}"
  say "Deleting signed and unsigned images from ${ECR_REPO_NAME}"
  IMAGE_IDS="$(aws ecr list-images --region "$AWS_REGION" --repository-name "$REPO_NAME" \
    --query 'imageIds[*]' --output json 2>/dev/null || echo '[]')"
  if [[ "$IMAGE_IDS" != "[]" ]]; then
    aws ecr batch-delete-image --region "$AWS_REGION" --repository-name "$REPO_NAME" \
      --image-ids "$IMAGE_IDS" >/dev/null
    note "deleted images: $(echo "$IMAGE_IDS" | grep -c imageTag || true) tag(s)"
  else
    note "no images left in ${REPO_NAME}"
  fi
else
  note "no repositoryUrl stack output found — skipping explicit image deletion"
fi

say "Running pulumi destroy in 01-platform (removes the ECR repository, kind cluster, Kyverno chart and ClusterPolicy)"
pulumi destroy --cwd "$PLATFORM_DIR" --yes

say "Removing local Notation signing key material"
"$DIR/../00-signing-key/generate.sh" --clean

note "teardown complete. Verify no images remain in the AWS console if you want a second check."
