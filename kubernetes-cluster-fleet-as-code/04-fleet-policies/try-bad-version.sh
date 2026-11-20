#!/usr/bin/env bash
# try-bad-version.sh - step 4: break the baseline on purpose and watch the
# policy pack stop the preview.
#   1. Create the canary-1 stack if it does not exist yet (Pulumi.canary-1.yaml
#      is committed and attaches the ESC environment fleet/canary-1).
#   2. Set kubernetesVersion to 1.33 in that ESC environment.
#   3. `pulumi preview --policy-pack`: expected to fail with a mandatory violation.
#   4. Put kubernetesVersion back to 1.35 (also on failure or Ctrl-C).
# Needs: PULUMI_ORG, a logged-in Pulumi CLI, 01-subscription and 02-esc done, 03-fleet-core deployed.
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
: "${PULUMI_ORG:?set PULUMI_ORG to your Pulumi Cloud organization}"
ENV_REF="$PULUMI_ORG/fleet/canary-1"
KEY='pulumiConfig["fleet-cluster:kubernetesVersion"]'

restore() {
  echo "-- restoring kubernetesVersion 1.35 in $ENV_REF"
  pulumi env set "$ENV_REF" "$KEY" 1.35 --string
}
trap restore EXIT

cd "$HERE/../05-fleet-cluster" || exit 1
pulumi stack select --create "$PULUMI_ORG/canary-1" || exit 1

echo "-- setting kubernetesVersion 1.33 in $ENV_REF"
pulumi env set "$ENV_REF" "$KEY" 1.33 --string || exit 1

echo "-- pulumi preview with the fleet-baseline policy pack"
pulumi preview --stack "$PULUMI_ORG/canary-1" --policy-pack "$HERE" --non-interactive
status=$?
echo "exit=$status  (non-zero: the mandatory policy aks-supported-version blocked the preview)"
