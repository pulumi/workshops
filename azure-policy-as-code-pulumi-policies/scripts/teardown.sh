#!/usr/bin/env bash
# Teardown. Run from inside the step folder you last deployed:
#   ../scripts/teardown.sh
# A management group must be empty before it can be deleted, so the
# subscription goes back to its original parent first.
set -euo pipefail

STACK="${STACK:-dev}"
MG_ID="ws-governance"

sub_id="$(pulumi config get azure-native:subscriptionId)"
original_parent="${ORIGINAL_PARENT:-$(az account show --query tenantId -o tsv)}"

echo "Removing exemption and remediation first"
pulumi destroy --yes --stack "$STACK" \
  --target-dependents \
  --target "urn:pulumi:${STACK}::azure-policy-workshop::workshop:azure:AzureStorageBaseline\$azure-native:authorization:PolicyExemption::baseline-exemption-0" \
  --target "urn:pulumi:${STACK}::azure-policy-workshop::azure-native:policyinsights:RemediationAtManagementGroup::remediate-tags" \
  || echo "No exemption or remediation to remove in this step"

if az account management-group subscription show --name "$MG_ID" --subscription "$sub_id" >/dev/null 2>&1; then
  echo "Moving subscription back to ${original_parent}"
  az account management-group subscription add --name "$original_parent" --subscription "$sub_id"
fi

pulumi destroy --yes --stack "$STACK"
pulumi stack rm --yes "$STACK"

echo "Check that nothing is left:"
az account management-group show --name "$MG_ID" >/dev/null 2>&1 && echo "management group still exists" || echo "management group gone"
az group exists --name rg-policy-ws
