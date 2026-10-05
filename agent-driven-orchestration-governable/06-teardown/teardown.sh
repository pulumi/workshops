#!/usr/bin/env bash
# Tears down the demo stack and resets local state so the folder is back to
# a clean checkout. Also the between-runs reset a presenter uses before a
# rehearsal or a repeat delivery.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${ROOT_DIR}/.pulumi-local-state"
AUDIT_DIR="${ROOT_DIR}/.audit"

export PULUMI_BACKEND_URL="file://${STATE_DIR}"
export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-agent-driven-orchestration-governable-demo}"

if [ -d "${STATE_DIR}" ]; then
  echo "Destroying stack 'dev' in ${ROOT_DIR}/01-fleet ..."
  (cd "${ROOT_DIR}/01-fleet" && pulumi destroy --stack dev --yes --skip-preview) || \
    echo "pulumi destroy reported an issue; continuing to remove local state anyway."
  (cd "${ROOT_DIR}/01-fleet" && pulumi stack rm dev --yes) || true
else
  echo "No local state directory found at ${STATE_DIR}; nothing to destroy."
fi

echo "Removing local backend state directory ..."
rm -rf "${STATE_DIR}"

echo "Removing audit log ..."
rm -rf "${AUDIT_DIR}"

echo "Teardown complete: no stack, no local state, no audit log left behind."
