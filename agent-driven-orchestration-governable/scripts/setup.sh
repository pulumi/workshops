#!/usr/bin/env bash
# Presenter's one-time setup, run once per machine (or after teardown.sh):
# installs dependencies in every TypeScript project and points Pulumi at a
# throwaway local backend. No cloud account and no credentials are needed —
# everything in this workshop runs against the `random` provider.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="${ROOT_DIR}/.pulumi-local-state"

echo "Node: $(node --version)  npm: $(npm --version)  Pulumi: $(pulumi version)"

mkdir -p "${STATE_DIR}" "${ROOT_DIR}/.audit"

for dir in 01-fleet 02-policy 03-orchestrator 04-audit 05-llm-stretch; do
  echo "npm install: ${dir}"
  (cd "${ROOT_DIR}/${dir}" && npm install --no-audit --no-fund)
done

export PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE:-agent-driven-orchestration-governable-demo}"
pulumi login "file://${STATE_DIR}"

echo
echo "Setup complete. Local backend: file://${STATE_DIR}"
echo "Demo passphrase (not a secret — protects only this throwaway local backend):"
echo "  PULUMI_CONFIG_PASSPHRASE=${PULUMI_CONFIG_PASSPHRASE}"
echo "Export that in every shell you run pulumi/orchestrator commands from."
