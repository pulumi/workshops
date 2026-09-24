#!/usr/bin/env bash
# tools-list.sh — stand up the Pulumi MCP server and print its real tool
# manifest via a live `initialize` + `tools/list` JSON-RPC round trip. This is
# the outcome for step 2: "the server answers a manual tool-list request."
# The printed names are the ones to say out loud; do not read them off a
# README, since the published package can change its manifest between runs.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

say "Requesting tools/list from $WORKSHOP_MCP_SERVER_PKG (stdio)"
# shellcheck disable=SC2016 # single quotes are deliberate: this is a Node script, not a bash expansion
mcp_call tools/list | node -e '
const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
for (const t of data.tools || []) {
  console.log(`- ${t.name}: ${t.description}`);
}
console.log(`\n${(data.tools || []).length} tool(s) total.`);
'
