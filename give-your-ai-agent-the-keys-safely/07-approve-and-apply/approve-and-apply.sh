#!/usr/bin/env bash
# approve-and-apply.sh -- apply the corrected (tagged) version of the logs
# bucket change. This script stands in for a HUMAN: someone who read
# ../05-review-the-diff/REVIEW.md, saw check 1 fail ("request changes: add
# tags" -- the new logs bucket carried no tags, breaking the convention every
# other resource in index.ts follows), required that fix, and is now applying
# the corrected change themselves. This is not the agent's job. The agent's
# job stopped at proposing (../04-propose-change); everything below runs as
# the human, only after the human's review required and then confirmed the
# fix.
#
# NOT RUN: this script was written and shellchecked but not executed against
# real AWS/Pulumi Cloud infrastructure in this build. This workstation has no
# AWS credentials and no Pulumi Cloud stack to apply to -- the same reason
# ../06-blocked-apply/try-apply.sh's token-layer attempt (attempt 2) could
# not run for real either. A presenter runs this for real, from a checkout
# with AWS and Pulumi Cloud credentials configured, only after doing the
# review this script assumes already happened.
set -uo pipefail

say() {
    printf '\n=== %s ===\n' "$1"
}

cd "$(dirname "${BASH_SOURCE[0]}")/../01-base-stack" || exit 1

say "Applying the corrected diff (tags fix from ../05-review-the-diff/REVIEW.md, check 1) to index.ts"
patch -p1 <<'PATCH_EOF'
--- a/index.ts
+++ b/index.ts
@@ -37,8 +37,17 @@
     },
 });
 
+const logs = new aws.s3.Bucket("logs", {
+    bucketPrefix: `${namePrefix}logs-`,
+    tags: {
+        ...tags,
+        purpose: "access-logs",
+    },
+});
+
 export const vpcId = vpc.id;
 export const subnetId = subnet.id;
 export const artifactsBucketName = artifacts.bucket;
 export const artifactsBucketArn = artifacts.arn;
+export const logsBucketName = logs.bucket;
 export const region = aws.getRegionOutput().apply((r) => r.region);
PATCH_EOF
patch_exit=$?
echo "exit=$patch_exit"
if [ "$patch_exit" -ne 0 ]; then
    echo "patch failed to apply -- stopping before touching real infrastructure" >&2
    exit 1
fi

say "pulumi preview --stack dev"
pulumi preview --stack dev
preview_exit=$?
echo "exit=$preview_exit"
if [ "$preview_exit" -ne 0 ]; then
    echo "preview failed -- stopping before pulumi up" >&2
    exit 1
fi

say "pulumi up --stack dev --yes"
pulumi up --stack dev --yes
echo "exit=$?"

# The logs bucket now exists with a human's explicit approval on record: the
# request-changes review in ../05-review-the-diff/REVIEW.md named the missing
# tags as the reason to withhold approval, this script applied the diff with
# that fix, and the pulumi up above is that approval acted on by a human --
# not the agent. The agent's job stopped at proposing; this script is the
# human's, and it only ran after a human required and then confirmed the fix
# the review demanded. That human approval on record is the point of the
# whole exercise.
