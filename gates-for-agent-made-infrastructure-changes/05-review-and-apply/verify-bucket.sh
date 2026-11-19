#!/usr/bin/env bash
# verify-bucket.sh: confirm the second bucket is tagged, encrypted and blocks
# public access, straight from AWS rather than from Pulumi state.
#
#   05-review-and-apply/verify-bucket.sh <bucket-name>
#
# The AWS CLI runs under the credential environment (pulumi env run), so it
# needs an active access grant for the identity running this script. Each check
# prints the AWS response; a failing check stops the script.
# Region is fixed to eu-west-1 (AWS_REGION_DEMO from lib.sh).
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org
require_cmd pulumi aws

BUCKET="${1:-}"
[ -n "$BUCKET" ] || die "usage: verify-bucket.sh <bucket-name>  (see 'pulumi stack output' for the name)"

aws_in_env() {
  pulumi env run "$(esc_fqn)" -- aws "$@" --region "$AWS_REGION_DEMO"
}

info "tags (expect owner and change-ref)"
aws_in_env s3api get-bucket-tagging --bucket "$BUCKET"

info "server-side encryption (expect a rule)"
aws_in_env s3api get-bucket-encryption --bucket "$BUCKET"

info "public access block (expect all four settings true)"
aws_in_env s3api get-public-access-block --bucket "$BUCKET"

info "ok: $BUCKET passes the three checks the policies enforce"
