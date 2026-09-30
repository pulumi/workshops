#!/usr/bin/env bash
# verify-clean.sh -- confirm nothing billable remains after teardown.sh.
#
# Checks, in order:
#   1. The Cognitive Services / AI Foundry account is gone.
#   2. The account is not sitting in Azure's soft-delete state -- Cognitive
#      Services accounts soft-delete by default, and a soft-deleted account
#      still counts toward subscription quota and can block a future
#      account reusing the same custom subdomain. Purges it if found.
#   3. The storage account used for runbook uploads is gone.
#
# Requires the az CLI, logged in to the same subscription the workshop
# used, and requires that teardown.sh has already run. This script could
# NOT be executed on the build workstation (no az CLI here, and it is not
# installable in this sandbox -- see AGENTS.md). It is written correctly
# for a presenter's real machine, not exercised live during this build.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSHOP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

PLATFORM_STACK="organization/itops-foundry-platform/dev"
TOOL_CONNECTION_STACK="organization/itops-tool-connection/dev"
PLATFORM_DIR="${WORKSHOP_ROOT}/02-foundry-platform"
TOOL_CONNECTION_DIR="${WORKSHOP_ROOT}/04-tool-connection"

# `pulumi destroy` removes a stack's resources but not the stack itself
# ("The stack itself is not deleted" -- pulumi destroy --help), so
# `pulumi stack output` still resolves after teardown.sh has run.
account_name="$(pulumi stack output account_name --stack "${PLATFORM_STACK}" --cwd "${PLATFORM_DIR}")"
resource_group="$(pulumi stack output resource_group_name --stack "${PLATFORM_STACK}" --cwd "${PLATFORM_DIR}")"
storage_account_name="$(pulumi stack output storage_account_name --stack "${TOOL_CONNECTION_STACK}" --cwd "${TOOL_CONNECTION_DIR}")"

fail=0

echo "==> Checking Cognitive Services / AI Foundry account '${account_name}' is gone..."
if az cognitiveservices account show --name "${account_name}" --resource-group "${resource_group}" >/dev/null 2>&1; then
  echo "FAIL: account '${account_name}' still exists in resource group '${resource_group}'."
  fail=1
else
  echo "OK: account not found."
fi

echo "==> Checking for a soft-deleted copy of '${account_name}'..."
deleted_location="$(az cognitiveservices account list-deleted \
  --query "[?name=='${account_name}'].location" -o tsv)"
if [[ -n "${deleted_location}" ]]; then
  echo "FOUND: '${account_name}' is soft-deleted in '${deleted_location}'; it still counts against quota. Purging..."
  az cognitiveservices account purge \
    --location "${deleted_location}" \
    --resource-group "${resource_group}" \
    --name "${account_name}"
  echo "OK: purged."
else
  echo "OK: no soft-deleted copy found."
fi

echo "==> Checking storage account '${storage_account_name}' is gone..."
if az storage account show --name "${storage_account_name}" --resource-group "${resource_group}" >/dev/null 2>&1; then
  echo "FAIL: storage account '${storage_account_name}' still exists in resource group '${resource_group}'."
  fail=1
else
  echo "OK: storage account not found."
fi

if [[ "${fail}" -eq 0 ]]; then
  echo "PASS: nothing billable remains."
  exit 0
fi
echo "FAIL: see above."
exit 1
