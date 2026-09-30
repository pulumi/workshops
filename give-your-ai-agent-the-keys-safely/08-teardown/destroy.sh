#!/usr/bin/env bash
# destroy.sh -- tear down the workshop's base stack (01-base-stack) for real.
#   1. `pulumi destroy --stack dev --yes` deletes every resource the stack
#      manages: the VPC, its subnet, and the artifacts bucket (plus the logs
#      bucket too, if 07-approve-and-apply's change was applied).
#   2. `pulumi stack rm dev --yes` removes the now-empty stack from the
#      backend, so it stops appearing in `pulumi stack ls`.
#   3. A closing note asks you to confirm removal by looking, in both the
#      Pulumi Cloud console and the AWS console, since neither `destroy` nor
#      `stack rm` reporting success proves the cloud side actually matches.
#
# NOT RUN: this script was written and shellchecked but not executed as part
# of this build. This workstation has no AWS credentials and no Pulumi Cloud
# stack to destroy, so there is nothing here yet for the commands below to
# tear down.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../01-base-stack"

echo "pulumi destroy --stack dev --yes"
pulumi destroy --stack dev --yes

echo "pulumi stack rm dev --yes"
pulumi stack rm dev --yes

cat <<'EOF'

Destroy and stack removal both reported success above. Before calling
teardown complete, confirm by looking:
  - Pulumi Cloud console: the "dev" stack for this project should be gone
    from the stack list.
  - AWS console (VPC and S3): the VPC, its subnet, and both buckets
    (artifacts, and logs if 07-approve-and-apply ran) should no longer
    appear in the account/region this workshop used.
EOF
