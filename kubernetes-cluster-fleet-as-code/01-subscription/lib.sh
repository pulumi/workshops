#!/usr/bin/env bash
# lib.sh - shared by prepare.sh and cleanup.sh. Source it, do not run it.

APP_NAME="${APP_NAME:-pulumi-esc-fleet-workshop}"
FEDERATED_CREDENTIAL_NAME="${FEDERATED_CREDENTIAL_NAME:-pulumi-esc-fleet}"
# shellcheck disable=SC2034 # read by prepare.sh, which sources this file
ESC_ISSUER="https://api.pulumi.com/oidc"

say() { printf '\n== %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

require_tools() {
  have az || die "Azure CLI (az) not found"
  : "${PULUMI_ORG:?set PULUMI_ORG to your Pulumi Cloud organization}"
  az account show >/dev/null 2>&1 || die "not logged in: run az login"
}

# The audience for ESC is the organization name prefixed with azure:
# (https://www.pulumi.com/docs/esc/environments/configuring-oidc/azure/).
esc_audience() { printf 'azure:%s' "$PULUMI_ORG"; }

# The subject Azure must accept. The OIDC guide documents this syntax for
# environments used from Pulumi IaC, with the literal value <yaml>.
esc_subject() { printf 'pulumi:environments:org:%s:env:<yaml>' "$PULUMI_ORG"; }
