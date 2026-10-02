#!/usr/bin/env bash
# Step 6: widen one binding (project-level Owner for the service account) and
# run the update with the policy pack attached. The run is expected to fail.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$here/../01-gcp"
pulumi config set widen true
if pulumi up --yes --policy-pack ../03-policy; then
  echo "Unexpected: the policy pack did not block the widened binding." >&2
  exit 1
fi
echo "Blocked as expected. Nothing was applied."
