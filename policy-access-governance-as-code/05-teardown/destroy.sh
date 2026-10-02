#!/usr/bin/env bash
# Step 7: destroy both stacks, then show what is left.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

(cd "$here/../01-gcp" && pulumi config set widen false && pulumi destroy --yes)
(cd "$here/../02-aws" && pulumi destroy --yes)

echo "GCP service accounts named access-demo-runner (a deleted one stays recoverable for 30 days):"
gcloud iam service-accounts list --filter="email~access-demo-runner" --format="value(email)"
echo "(empty above = none left)"
