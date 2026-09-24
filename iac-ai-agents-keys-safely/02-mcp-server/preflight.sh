#!/usr/bin/env bash
# preflight.sh — check the tools this step needs before the demo starts.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

say "Checking prerequisites for 02-mcp-server"

have node || die "node is required (Node.js 20+; see root README)"
note "node: $(node --version)"

have npx || die "npx is required (ships with Node.js)"
note "npx: $(npx --version)"

have pulumi || die "pulumi CLI is required"
note "pulumi: $(pulumi version)"

say "Starting the Pulumi MCP server once and asking for its tool manifest"
mcp_call tools/list >/tmp/workshop-mcp-tools.json || die "the MCP server did not answer tools/list"
tool_count=$(grep -c '"name":' /tmp/workshop-mcp-tools.json || true)
note "server answered with $tool_count tool(s) — see ./tools-list.sh for the full manifest"

note "Preflight OK."
