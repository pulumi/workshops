#!/usr/bin/env bash
set -euo pipefail

# --- Configuration (override via environment variables) ---------------------
# Defaults match this workshop's fixed demo cluster (see ../02-cluster). To
# derive live values from the deployed Pulumi stack instead of hardcoding them:
#   NAMESPACE=$(pulumi stack output namespace -C ../02-cluster)
#   CLUSTER_NAME=$(pulumi stack output clusterName -C ../02-cluster)
#   BUCKET_NAME=$(pulumi stack output bucketName -C ../02-cluster)
NAMESPACE="${NAMESPACE:-cnpg-demo}"
CLUSTER_NAME="${CLUSTER_NAME:-pg-demo}"

TIMEOUT_SECS="${TIMEOUT_SECS:-120}"
POLL_INTERVAL_SECS="${POLL_INTERVAL_SECS:-5}"

say() { printf '>>> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

command -v kubectl >/dev/null 2>&1 || die "kubectl not found on PATH"
command -v kubectl-cnpg >/dev/null 2>&1 \
  || die "kubectl cnpg plugin not found on PATH (looked for 'kubectl-cnpg'). Install: https://cloudnative-pg.io/documentation/current/kubectl-plugin/"

say "Triggering an on-demand backup of '${CLUSTER_NAME}' (namespace: ${NAMESPACE}) via the Barman Cloud Plugin"
# Plugin-based backup (barman-cloud.cloudnative-pg.io). This is the current,
# supported invocation -- NOT the deprecated in-tree '--method=barmanObjectStore'
# form.
backup_create_output="$(kubectl cnpg backup -n "${NAMESPACE}" "${CLUSTER_NAME}" \
  --method=plugin \
  --plugin-name=barman-cloud.cloudnative-pg.io)"
printf '%s\n' "${backup_create_output}"

# The plugin prints e.g. "backup/pg-demo-20260929113000 created"; pull the
# object name out regardless of any other lines that may precede it.
backup_name="$(printf '%s\n' "${backup_create_output}" | awk -F'[/ ]' '/^backup\// {print $2; exit}')"
[[ -n "${backup_name}" ]] || die "Could not parse the created Backup object's name from: ${backup_create_output}"
say "Created Backup object: ${backup_name}"

say "Waiting up to ${TIMEOUT_SECS}s for Backup '${backup_name}' to reach phase 'completed'..."
elapsed=0
phase=""
while (( elapsed < TIMEOUT_SECS )); do
  phase="$(kubectl get backup -n "${NAMESPACE}" "${backup_name}" -o jsonpath='{.status.phase}' 2>/dev/null || true)"
  case "${phase}" in
    completed)
      say "Backup '${backup_name}' completed after ~${elapsed}s"
      break
      ;;
    failed|"invalid backup definition")
      die "Backup '${backup_name}' entered phase '${phase}'. Check 'kubectl describe backup ${backup_name} -n ${NAMESPACE}' for details."
      ;;
    *)
      say "  ...phase='${phase:-<none yet>}' (waited ${elapsed}s)"
      ;;
  esac
  sleep "${POLL_INTERVAL_SECS}"
  elapsed=$(( elapsed + POLL_INTERVAL_SECS ))
done

if [[ "${phase}" != "completed" ]]; then
  die "Timed out after ${TIMEOUT_SECS}s waiting for Backup '${backup_name}' to complete (last phase: '${phase}')."
fi

kubectl describe backup -n "${NAMESPACE}" "${backup_name}"

# --- Presenter-only verification: confirm the backup actually landed in S3 --
# This step needs the `aws` CLI and real AWS credentials in the presenter's
# environment. It is not required for the demo itself to succeed -- a missing
# `aws` CLI (or missing bucket output) only produces a warning here, never a
# hard failure of this script, since the Backup resource already reported
# phase=completed above.
if ! command -v aws >/dev/null 2>&1; then
  warn "aws CLI not found on PATH; skipping S3 verification of '${backup_name}'."
  warn "To check manually once 'aws' is available: aws s3 ls s3://<bucket>/ --recursive"
  exit 0
fi

if [[ -z "${BUCKET_NAME:-}" ]]; then
  say "BUCKET_NAME not set; deriving it from the 02-cluster stack output..."
  if BUCKET_NAME="$(pulumi stack output bucketName -C ../02-cluster 2>/dev/null)" && [[ -n "${BUCKET_NAME}" ]]; then
    say "Using BUCKET_NAME=${BUCKET_NAME}"
  else
    warn "Could not read 'bucketName' from ../02-cluster (was it deployed with backupsEnabled=true?); skipping S3 verification."
    exit 0
  fi
fi

say "Listing S3 contents for bucket '${BUCKET_NAME}' (presenter-only sanity check)"
if ! aws s3 ls "s3://${BUCKET_NAME}/" --recursive; then
  warn "Could not list s3://${BUCKET_NAME}/ -- check AWS credentials. The backup itself already reported phase=completed above."
fi
