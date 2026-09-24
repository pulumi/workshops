#!/usr/bin/env bash
# destroy.sh — human-driven teardown of 01-base-stack, on the host, with a
# real AWS account and Stack-Write access. This is the only other script
# (besides 07-approve-and-apply) that changes real infrastructure.
#
#   08-teardown/destroy.sh          # unprotect, empty the buckets, destroy
#
# Both S3 buckets carry `protect: true` (the artifact bucket in the baseline
# program, the access-logs bucket if the agent's proposal was approved and
# applied), and S3 buckets must be empty before Pulumi can delete them
# (versioned buckets keep every version and delete marker, so a plain empty
# is not enough).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

have pulumi || die "pulumi CLI is required"
have aws || die "AWS CLI is required to empty the buckets before destroy"

cd "$BASE_STACK_DIR"

say "Reading stack outputs"
artifact_bucket="$(pulumi stack output artifactBucketName --stack dev 2>/dev/null || true)"
logs_bucket="$(pulumi stack output accessLogsBucketName --stack dev 2>/dev/null || true)"
[ -n "$artifact_bucket" ] || die "could not read artifactBucketName — is the dev stack up?"
note "artifact bucket: $artifact_bucket"
if [ -n "$logs_bucket" ]; then
  note "access-logs bucket: $logs_bucket (present — the proposal from 04-propose-change was applied)"
else
  note "no access-logs bucket in this stack's outputs (the proposal was never applied here) — nothing to empty for it"
fi

say "Unprotecting all resources"
pulumi state unprotect --all --yes --stack dev

say "Emptying bucket(s), including all versions and delete markers"
empty_bucket() {
  local bucket="$1"
  note "emptying s3://$bucket"
  aws s3api list-object-versions --bucket "$bucket" --output json \
    | node -e '
        const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
        const objects = [...(data.Versions || []), ...(data.DeleteMarkers || [])]
          .map((o) => ({ Key: o.Key, VersionId: o.VersionId }));
        console.log(JSON.stringify({ Objects: objects, Quiet: true }));
      ' > /tmp/workshop-teardown-delete-payload.json
  if [ "$(node -e 'console.log(JSON.parse(require("fs").readFileSync("/tmp/workshop-teardown-delete-payload.json","utf8")).Objects.length)')" != "0" ]; then
    aws s3api delete-objects --bucket "$bucket" --delete file:///tmp/workshop-teardown-delete-payload.json >/dev/null
  fi
  note "s3://$bucket is empty"
}
empty_bucket "$artifact_bucket"
[ -n "$logs_bucket" ] && empty_bucket "$logs_bucket"

say "Destroying the stack"
pulumi destroy --yes --stack dev

say "Verifying nothing is left"
pulumi stack --show-urns --stack dev
note "the line above should list no resources besides the stack itself."
note "Confirm no leftovers with: aws s3 ls | grep iac-ai-agents-keys-safely || true"
note "The stack itself is kept; remove it with: pulumi stack rm dev"
