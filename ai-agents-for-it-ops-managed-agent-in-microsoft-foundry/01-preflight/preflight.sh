#!/usr/bin/env bash
#
# preflight.sh — environment checks for the "AI Agents for IT Ops: Managed
# Agent in Microsoft Foundry" workshop. Run this before 02-foundry-platform.
#
# Checks, in order:
#   1. Pulumi CLI installed and >= the minimum version below.
#   2. Python >= the minimum version below.
#   3. Azure CLI logged in, with a subscription selected.
#   4. Reminder: the target region has Azure AI Foundry + a gpt-4o-class
#      model available for deployment.
#   5. Reminder: Foundry / Azure OpenAI access has been approved for the
#      subscription.
#
# Checks 1-3 are scriptable and print OK/FAIL. Checks 4-5 are not
# deterministically scriptable (region/model availability and access
# approval are account- and catalog-state, not something one CLI call can
# confirm), so they print a reminder with a link instead of a pass/fail.
#
# Exit code: 0 if every scriptable check (1-3) passed, 1 otherwise. The
# reminders never affect the exit code.

set -euo pipefail

readonly MIN_PULUMI_VERSION="3.263.0"
readonly MIN_PYTHON_VERSION="3.11"
readonly TARGET_REGION="${AZURE_LOCATION:-eastus2}"

failures=0

ok() {
  printf 'OK    %s\n' "$1"
}

fail() {
  printf 'FAIL  %s\n' "$1"
  failures=$((failures + 1))
}

info() {
  printf 'INFO  %s\n' "$1"
}

# version_ge A B — succeeds if version A is greater than or equal to B.
version_ge() {
  [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

check_pulumi() {
  if ! command -v pulumi >/dev/null 2>&1; then
    fail "pulumi CLI not found on PATH (need >= ${MIN_PULUMI_VERSION})"
    return
  fi

  local raw_version
  raw_version="$(pulumi version 2>/dev/null | head -n1)" || true
  local version="${raw_version#v}"

  if [ -z "$version" ]; then
    fail "pulumi CLI found but 'pulumi version' produced no output"
    return
  fi

  if version_ge "$version" "$MIN_PULUMI_VERSION"; then
    ok "pulumi CLI ${version} (>= ${MIN_PULUMI_VERSION} required)"
  else
    fail "pulumi CLI ${version} is older than the required ${MIN_PULUMI_VERSION}"
  fi
}

check_python() {
  local python_bin=""
  if command -v python3 >/dev/null 2>&1; then
    python_bin="python3"
  elif command -v python >/dev/null 2>&1; then
    python_bin="python"
  else
    fail "no python3/python interpreter found on PATH (need >= ${MIN_PYTHON_VERSION})"
    return
  fi

  local version
  version="$("$python_bin" -c 'import sys; print(".".join(map(str, sys.version_info[:3])))' 2>/dev/null)" || true

  if [ -z "$version" ]; then
    fail "${python_bin} found but its version could not be determined"
    return
  fi

  if version_ge "$version" "$MIN_PYTHON_VERSION"; then
    ok "${python_bin} ${version} (>= ${MIN_PYTHON_VERSION} required)"
  else
    fail "${python_bin} ${version} is older than the required ${MIN_PYTHON_VERSION}"
  fi
}

check_azure_login() {
  if ! command -v az >/dev/null 2>&1; then
    fail "az CLI not found on PATH — required to confirm login and subscription"
    return
  fi

  local subscription_id
  if ! subscription_id="$(az account show --query id -o tsv 2>/dev/null)"; then
    fail "az account show failed — run 'az login' and select a subscription"
    return
  fi

  if [ -n "$subscription_id" ]; then
    ok "az CLI logged in, subscription ${subscription_id} selected"
  else
    fail "az account show succeeded but returned no subscription id"
  fi
}

remind_region_model_availability() {
  info "confirm Azure AI Foundry and a gpt-4o-class model are available for deployment in region '${TARGET_REGION}'."
  info "region/model availability is not a single deterministic CLI call — check the model catalog before presenting:"
  info "  https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/models#model-summary-table-and-region-availability"
}

remind_foundry_access_approved() {
  info "confirm Azure AI Foundry / Azure OpenAI access has been approved for this subscription."
  info "access approval is account-level and not checkable from a CLI call — if unsure, see:"
  info "  https://learn.microsoft.com/en-us/azure/ai-services/openai/overview#how-do-i-get-access-to-azure-openai"
}

main() {
  printf '== ai-agents-for-it-ops-managed-agent-in-microsoft-foundry: preflight ==\n\n'

  check_pulumi
  check_python
  check_azure_login
  remind_region_model_availability
  remind_foundry_access_approved

  printf '\n'
  if [ "$failures" -eq 0 ]; then
    printf 'All scriptable checks passed.\n'
    exit 0
  fi

  printf '%d scriptable check(s) failed.\n' "$failures"
  exit 1
}

main "$@"
