#!/usr/bin/env bash
# teardown.sh: destroy the demo steps in reverse order.
# Usage: ORG=<your-org> scripts/teardown.sh
# Warning: AWS Private CA deletion is scheduled, not immediate. The CA is removed after the
# permanent deletion window (7 days in step 03) and is billed until then.
set -euo pipefail
: "${ORG:?set ORG to your Pulumi Cloud organization}"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for step in 08-pki-component 07-renewal-and-monitoring 06-vault-pki 05-first-certificate \
            04-cert-manager-pca-issuer 03-private-ca 02-eks-cluster; do
  echo "Destroying ${step}"
  (cd "${root}/${step}" && pulumi destroy --yes --stack "${ORG}/dev")
done
echo "Step 01 (ESC environment, stack) is kept; remove it with pulumi env rm and pulumi stack rm if you want."
