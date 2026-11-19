#!/usr/bin/env bash
# Checks the tools and the Azure login before the workshop starts.
set -euo pipefail

fail=0
need() {
  if command -v "$1" >/dev/null 2>&1; then
    echo "ok       $1: $("$1" --version 2>&1 | head -n 1)"
  else
    echo "MISSING  $1"
    fail=1
  fi
}

need node
need npm
need pulumi
need az

if command -v az >/dev/null 2>&1; then
  if az account show --query "{subscription:id, tenant:tenantId}" -o tsv >/dev/null 2>&1; then
    echo "ok       az login: $(az account show --query name -o tsv)"
    # Management group rights are the one tenant-level requirement.
    if az account management-group list --query "[].name" -o tsv >/dev/null 2>&1; then
      echo "ok       management groups are readable"
    else
      echo "WARN     cannot list management groups: use scopeMode=subscription (see README)"
    fi
  else
    echo "MISSING  az login (run: az login)"
    fail=1
  fi
fi

if pulumi whoami >/dev/null 2>&1; then
  echo "ok       pulumi login: $(pulumi whoami)"
else
  echo "MISSING  pulumi login (run: pulumi login)"
  fail=1
fi

exit "$fail"
