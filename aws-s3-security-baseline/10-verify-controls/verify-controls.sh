#!/usr/bin/env bash
# Step 10: read every control back from AWS, then try a plain-HTTP request.
# Usage: ORG=acme ./verify-controls.sh   (after 09-deploy/deploy.sh)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../lib.sh"

bucket="$(cd "$here/../06-secure-bucket" && pulumi stack output bucketName)"
run() { pulumi env run "$ESC_REF" -- "$@"; }

run aws s3api get-public-access-block --bucket "$bucket"
run aws s3api get-bucket-encryption --bucket "$bucket"
run aws s3api get-bucket-versioning --bucket "$bucket"
run aws s3api get-bucket-lifecycle-configuration --bucket "$bucket"
run aws s3api get-bucket-policy --bucket "$bucket"
run aws s3api get-bucket-ownership-controls --bucket "$bucket"

# The bucket policy denies requests without TLS, so this one must fail with AccessDenied.
echo "hello" > /tmp/s3-baseline-probe.txt
if run aws s3 cp /tmp/s3-baseline-probe.txt "s3://$bucket/probe.txt" --endpoint-url "http://s3.${REGION}.amazonaws.com"; then
    echo "Unexpected: the plain-HTTP upload succeeded" >&2
    exit 1
fi
echo "Plain-HTTP upload denied, as expected."
