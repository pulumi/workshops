#!/usr/bin/env bash
# create.sh - step 2: create the four ESC environments in project `fleet`.
#   fleet/azure-base   Azure OIDC login, region, VM size
#   fleet/canary-1, fleet/rest-1, fleet/rest-2
#                      import azure-base, set the update group and the Kubernetes version
# Needs: PULUMI_ORG, AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID (printed by
# 01-subscription/prepare.sh). LOCATION (default westeurope) is the region fallback switch.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
. "$HERE/lib.sh"
require_org
: "${AZURE_CLIENT_ID:?run 01-subscription/prepare.sh first and export its output}"
: "${AZURE_TENANT_ID:?}"
: "${AZURE_SUBSCRIPTION_ID:?}"

say "fleet/azure-base"
rendered="$(mktemp)"
trap 'rm -f "$rendered"' EXIT
sed -e "s/__AZURE_CLIENT_ID__/$AZURE_CLIENT_ID/" \
    -e "s/__AZURE_TENANT_ID__/$AZURE_TENANT_ID/" \
    -e "s/__AZURE_SUBSCRIPTION_ID__/$AZURE_SUBSCRIPTION_ID/" \
    -e "s/__LOCATION__/$LOCATION/" "$HERE/azure-base.yaml" >"$rendered"
pulumi env init "$PULUMI_ORG/fleet/azure-base" --file "$rendered"

for entry in "${CLUSTER_ENVS[@]}"; do
  name="${entry%%:*}"
  group="${entry##*:}"
  say "fleet/$name (group $group, Kubernetes $INITIAL_VERSION)"
  pulumi env init "$PULUMI_ORG/fleet/$name" --file "$HERE/cluster.yaml"
  pulumi env set "$PULUMI_ORG/fleet/$name" 'pulumiConfig["fleet-cluster:group"]' "$group" --string
  pulumi env set "$PULUMI_ORG/fleet/$name" 'pulumiConfig["fleet-cluster:kubernetesVersion"]' "$INITIAL_VERSION" --string
done

say "check: the merged config of the canary environment (secrets stay hidden here)"
pulumi env get "$PULUMI_ORG/fleet/canary-1"
echo "To see the resolved values, including the Azure token: pulumi env open $PULUMI_ORG/fleet/canary-1"
