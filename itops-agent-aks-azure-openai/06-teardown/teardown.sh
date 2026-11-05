#!/usr/bin/env bash
# teardown.sh: tear the whole stack down and verify nothing billable remains.
#
#   06-teardown/teardown.sh
#
# Steps 1-5 are one cumulative project and stack, so one `pulumi destroy` in
# 05-agent-deployment removes everything in reverse dependency order. Then:
# `az group show` (the group should be gone), `az resource list` (should
# return empty), and `az cognitiveservices account list-deleted` + `purge`
# for the soft-deleted OpenAI account, which would otherwise block reusing
# its name for the next delivery.
#
# Needs: pulumi login with access to the stack, az CLI logged in to the
# workshop subscription. Run it from anywhere; it locates the folders itself.
set -euo pipefail

WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESOURCE_GROUP="rg-itops-agent-aks-azure-openai"
OPENAI_ACCOUNT="itops-agent-openai"

say() { printf '\n=== %s ===\n' "$1"; }

# Read the location now: the group is gone after the destroy and purge needs it.
LOCATION="$(az group show --name "$RESOURCE_GROUP" --query location --output tsv 2>/dev/null || echo eastus2)"

say "destroying the stack (05-agent-deployment holds steps 1-5)"
(cd "$WORKSHOP_DIR/05-agent-deployment" && pulumi destroy --yes --stack dev)

say "az group show: the resource group should be gone"
if az group show --name "$RESOURCE_GROUP" --output table 2>/dev/null; then
  echo "WARNING: $RESOURCE_GROUP still exists"
else
  echo "clean: $RESOURCE_GROUP not found"
fi

say "az resource list: should be empty"
remaining="$(az resource list --resource-group "$RESOURCE_GROUP" --output tsv 2>/dev/null || true)"
if [ -n "$remaining" ]; then
  echo "WARNING: resources remain in $RESOURCE_GROUP:"
  echo "$remaining"
else
  echo "clean: nothing listed for $RESOURCE_GROUP"
fi

say "purging any soft-deleted Cognitive Services account"
if az cognitiveservices account list-deleted --output tsv 2>/dev/null | grep -q "$OPENAI_ACCOUNT"; then
  az cognitiveservices account purge \
    --location "$LOCATION" \
    --resource-group "$RESOURCE_GROUP" \
    --name "$OPENAI_ACCOUNT"
  echo "purged soft-deleted account $OPENAI_ACCOUNT"
else
  echo "no soft-deleted account named $OPENAI_ACCOUNT found"
fi

say "teardown complete"
