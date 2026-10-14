#!/usr/bin/env bash
set -euo pipefail

# --- Configuration (override via environment variables) ---------------------
RESTORE_DIR="${RESTORE_DIR:-../06-restore}"
CLUSTER_DIR="${CLUSTER_DIR:-../02-cluster}"
PLATFORM_DIR="${PLATFORM_DIR:-../01-platform}"

say() { printf '>>> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

command -v pulumi >/dev/null 2>&1 || die "pulumi CLI not found on PATH"

# --- 1. 06-restore: optional, presenter-only step; may never have been ------
#        deployed as a stack, so a destroy failure here does not stop teardown
if [[ -d "${RESTORE_DIR}" ]]; then
  say "Destroying ${RESTORE_DIR} (Pulumi project cnpg-workshop-restore) if it has a deployed stack..."
  if ! pulumi destroy -C "${RESTORE_DIR}" --yes; then
    warn "pulumi destroy in ${RESTORE_DIR} failed or found nothing to destroy (this step is presenter-only and may never have been deployed). Continuing."
  fi
else
  warn "${RESTORE_DIR} not found; skipping (it may not be checked out in this environment)."
fi

# --- 2. 02-cluster: the Postgres Cluster, ObjectStore, and demo namespace's data
say "Destroying ${CLUSTER_DIR} (Pulumi project cnpg-workshop-cluster)..."
pulumi destroy -C "${CLUSTER_DIR}" --yes

# --- 3. 01-platform: last. Its local.Command delete hook runs 'kind delete ---
#        cluster', destroying the kind node and every namespace/PVC with it.
say "Destroying ${PLATFORM_DIR} (kind cluster, cert-manager, CNPG operator, Barman Cloud Plugin)..."
pulumi destroy -C "${PLATFORM_DIR}" --yes

say "Teardown complete. Run 07-teardown/verify-clean.sh to double-check for leftover PVCs."
