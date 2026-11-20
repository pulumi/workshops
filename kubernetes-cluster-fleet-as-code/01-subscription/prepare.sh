#!/usr/bin/env bash
# prepare.sh - step 1: prepare the subscription for Pulumi ESC OIDC.
#   1. Register the resource provider the fleet needs.
#   2. Create an Entra app registration and its service principal.
#   3. Add a federated credential for Pulumi ESC (issuer, subject, audience).
#   4. Give the service principal Contributor on the subscription.
# Prints the three values the next step needs. No secret is created: OIDC
# replaces the client secret.
# Needs: az (logged in), PULUMI_ORG. Rights: create app registrations and role assignments.
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_tools

subscription_id="$(az account show --query id -o tsv)"
tenant_id="$(az account show --query tenantId -o tsv)"

say "registering Microsoft.ContainerService"
az provider register --namespace Microsoft.ContainerService --wait

say "creating the app registration $APP_NAME"
client_id="$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)"
az ad sp create --id "$client_id" >/dev/null

say "adding the federated credential for Pulumi ESC"
credential="$(mktemp)"
trap 'rm -f "$credential"' EXIT
cat >"$credential" <<JSON
{
  "name": "$FEDERATED_CREDENTIAL_NAME",
  "issuer": "$ESC_ISSUER",
  "subject": "$(esc_subject)",
  "audiences": ["$(esc_audience)"]
}
JSON
az ad app federated-credential create --id "$client_id" --parameters "$credential" >/dev/null

say "assigning Contributor on the subscription"
az role assignment create --assignee "$client_id" --role Contributor \
  --scope "/subscriptions/$subscription_id" >/dev/null

say "done. Export these for 02-esc/create.sh:"
printf 'export AZURE_CLIENT_ID=%s\nexport AZURE_TENANT_ID=%s\nexport AZURE_SUBSCRIPTION_ID=%s\n' \
  "$client_id" "$tenant_id" "$subscription_id"
