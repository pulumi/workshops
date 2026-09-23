#!/usr/bin/env bash
# teardown.sh — tear the whole stack down and verify nothing billable remains.
#
#   06-teardown/teardown.sh
#
# Destroys the five stacks in reverse dependency order, then checks the
# resource group is empty and purges any soft-deleted Cognitive Services
# account (AKS and Cognitive Services can both leave soft-deleted state
# behind that blocks name reuse on the next delivery, including the second
# regional one — see the root README's Risks section).
#
# Needs: pulumi login on the host with access to each stack, az CLI logged
# in to the workshop subscription. Run from the workshop's root folder.
set -euo pipefail

WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESOURCE_GROUP="rg-itops-agent-aks-azure-openai"
OPENAI_ACCOUNT="itops-agent-openai"

say() { printf '\n=== %s ===\n' "$1"; }

say "destroying 05-agent-deployment"
(cd "$WORKSHOP_DIR/05-agent-deployment" && pulumi destroy --yes --stack dev)

say "destroying 04-workload-identity"
(cd "$WORKSHOP_DIR/04-workload-identity" && pulumi destroy --yes --stack dev)

say "destroying 03-azure-openai"
(cd "$WORKSHOP_DIR/03-azure-openai" && pulumi destroy --yes --stack dev)

say "destroying 02-aks-cluster"
(cd "$WORKSHOP_DIR/02-aks-cluster" && pulumi destroy --yes --stack dev)

say "destroying 01-empty-program"
(cd "$WORKSHOP_DIR/01-empty-program" && pulumi destroy --yes --stack dev)

say "verifying the resource group is empty"
remaining="$(az resource list --resource-group "$RESOURCE_GROUP" --output tsv 2>/dev/null || true)"
if [ -n "$remaining" ]; then
  echo "WARNING: resources remain in $RESOURCE_GROUP:"
  echo "$remaining"
else
  echo "clean: az resource list returns empty for $RESOURCE_GROUP"
fi

say "purging any soft-deleted Cognitive Services account"
# Cognitive Services accounts soft-delete for a retention period; purge so
# the same account name can be reused for the next delivery of this
# workshop (there is a second, undated regional session — purge after
# every delivery, not just the last one).
if az cognitiveservices account list-deleted --output tsv 2>/dev/null | grep -q "$OPENAI_ACCOUNT"; then
  az cognitiveservices account purge \
    --location "$(az group show --name "$RESOURCE_GROUP" --query location -o tsv 2>/dev/null || echo eastus2)" \
    --resource-group "$RESOURCE_GROUP" \
    --name "$OPENAI_ACCOUNT"
  echo "purged soft-deleted account $OPENAI_ACCOUNT"
else
  echo "no soft-deleted account named $OPENAI_ACCOUNT found"
fi

say "teardown complete"
