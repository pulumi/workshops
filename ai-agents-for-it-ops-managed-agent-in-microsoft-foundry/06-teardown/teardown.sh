#!/usr/bin/env bash
# teardown.sh -- destroy the AI Agents for IT Ops (Microsoft Foundry)
# workshop stacks, in strict reverse build order, stopping on the first
# failure. See AGENTS.md in this folder for why this order, and why there
# is no 01-preflight stack to destroy.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSHOP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# folder:fully-qualified-stack-name, in strict reverse build order.
STACKS=(
  "04-tool-connection:organization/itops-tool-connection/dev"
  "03-agent:organization/itops-agent/dev"
  "02-foundry-platform:organization/itops-foundry-platform/dev"
)

for entry in "${STACKS[@]}"; do
  folder="${entry%%:*}"
  stack="${entry#*:}"
  dir="${WORKSHOP_ROOT}/${folder}"
  echo "==> Destroying ${stack} (${dir})"
  pulumi destroy --yes --non-interactive --stack "${stack}" --cwd "${dir}"
done

echo "==> Stacks destroyed. Run ./verify-clean.sh next -- Cognitive Services"
echo "    soft-deletes by default, so the account can still be billable"
echo "    until it is purged."
