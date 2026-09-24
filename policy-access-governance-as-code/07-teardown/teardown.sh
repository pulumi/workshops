#!/usr/bin/env bash
# teardown.sh - destroy every stack, both clouds, in reverse dependency order.
#
#   07-teardown/teardown.sh
#
# Steps 1-4 are independent Pulumi Python projects (no cross-stack
# references), so destroy order between them does not matter for
# correctness, but this script destroys 4 -> 1 to mirror the order they were
# built in during the demo. Step 5 (the policy pack) and step 6 (a patch)
# have no stack of their own - step 6 is reverted, not destroyed.
#
# Needs: pulumi login on the host with access to each stack, gcloud and aws
# CLIs authenticated to the workshop's GCP project and AWS account. Run from
# the workshop's root folder.
set -euo pipefail

WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

say() { printf '\n=== %s ===\n' "$1"; }

say "reverting the step 6 patch, if still applied"
if (cd "$WORKSHOP_DIR/03-service-account" && git apply -R "$WORKSHOP_DIR/06-over-broad-binding/widen-service-account-to-project-owner.patch" 2>/dev/null); then
  echo "reverted the over-broad binding patch"
else
  echo "patch was not applied, or already reverted - nothing to do"
fi

say "destroying 04-aws-role"
(cd "$WORKSHOP_DIR/04-aws-role" && pulumi destroy --yes --stack dev)

say "destroying 03-service-account"
(cd "$WORKSHOP_DIR/03-service-account" && pulumi destroy --yes --stack dev)

say "destroying 02-secret"
(cd "$WORKSHOP_DIR/02-secret" && pulumi destroy --yes --stack dev)

say "destroying 01-bigquery-dataset"
(cd "$WORKSHOP_DIR/01-bigquery-dataset" && pulumi destroy --yes --stack dev)

say "running the cleanup verification"
"$WORKSHOP_DIR/07-teardown/verify-clean.sh"

say "teardown complete"
