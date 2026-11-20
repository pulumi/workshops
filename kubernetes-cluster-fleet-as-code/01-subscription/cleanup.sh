#!/usr/bin/env bash
# cleanup.sh - last part of step 9: remove what prepare.sh created.
# Deleting the app registration removes its service principal, its federated
# credential and, with it, the role assignment's principal. Then it lists what
# is left so the end state can be read off the screen.
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_tools

say "looking for app registrations named $APP_NAME"
mapfile -t app_ids < <(az ad app list --display-name "$APP_NAME" --query '[].appId' -o tsv)
for app_id in "${app_ids[@]}"; do
  [ -n "$app_id" ] || continue
  say "deleting app registration $app_id"
  az ad app delete --id "$app_id"
done

say "left over (all three lists should be empty)"
az ad app list --display-name "$APP_NAME" --query '[].appId' -o tsv
az group list --query "[?name=='rg-fleet-workshop'].name" -o tsv
az aks list --query '[].name' -o tsv
