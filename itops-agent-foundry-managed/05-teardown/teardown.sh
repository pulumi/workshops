#!/usr/bin/env bash
# teardown.sh - tear the whole stack down and verify nothing billable remains.
#
#   05-teardown/teardown.sh
#
# Destroys the three Pulumi-managed stacks in reverse dependency order (step
# 4 has no stack, it is a data-plane script), then checks the resource group
# is empty and purges any soft-deleted Cognitive Services account. Both the
# Foundry account and the storage account can leave soft-deleted state
# behind that blocks name reuse on the next delivery, including the second
# regional one - see the root README's Risks section.
#
# Needs: pulumi login on the host with access to each stack, az CLI logged
# in to the workshop subscription. Run from the workshop's root folder.
set -euo pipefail

WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESOURCE_GROUP="rg-itops-agent-foundry-managed"
FOUNDRY_ACCOUNT="itops-agent-foundry"

say() { printf '\n=== %s ===\n' "$1"; }

say "deleting the exercise agent, if the exercise script left one behind"
echo "run 'python 04-exercise-agent/exercise_agent.py' clean-up path already" \
  "calls agents_client.delete_agent(); this is a safety net only, and" \
  "needs FOUNDRY_PROJECT_ENDPOINT set the same way the exercise script needs it."

say "destroying 03-tool-connection"
(cd "$WORKSHOP_DIR/03-tool-connection" && pulumi destroy --yes --stack dev)

say "destroying 02-create-agent"
(cd "$WORKSHOP_DIR/02-create-agent" && pulumi destroy --yes --stack dev)

say "destroying 01-foundry-project"
(cd "$WORKSHOP_DIR/01-foundry-project" && pulumi destroy --yes --stack dev)

say "verifying the resource group is empty"
remaining="$(az resource list --resource-group "$RESOURCE_GROUP" --output tsv 2>/dev/null || true)"
if [ -n "$remaining" ]; then
  echo "WARNING: resources remain in $RESOURCE_GROUP:"
  echo "$remaining"
else
  echo "clean: az resource list returns empty for $RESOURCE_GROUP"
fi

say "purging any soft-deleted Cognitive Services (Foundry) account"
# Cognitive Services accounts, including AIServices/Foundry accounts,
# soft-delete for a retention period; purge so the same account name can be
# reused for the next delivery of this workshop (there is a second, undated
# regional session - purge after every delivery, not just the last one).
if az cognitiveservices account list-deleted --output tsv 2>/dev/null | grep -q "$FOUNDRY_ACCOUNT"; then
  az cognitiveservices account purge \
    --location "$(az group show --name "$RESOURCE_GROUP" --query location -o tsv 2>/dev/null || echo eastus2)" \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FOUNDRY_ACCOUNT"
  echo "purged soft-deleted account $FOUNDRY_ACCOUNT"
else
  echo "no soft-deleted account named $FOUNDRY_ACCOUNT found"
fi

say "teardown complete"
