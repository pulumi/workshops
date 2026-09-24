#!/usr/bin/env bash
# lib.sh — shared bits for the 02-mcp-server scripts (sourced, not run).
# shellcheck disable=SC2034 # variables are used by the scripts that source this file
FOLDER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_STACK_DIR="$(cd "$FOLDER_DIR/../01-base-stack" && pwd)"

# The published Pulumi MCP server. Pinned to an exact version: the package has
# not been re-published since 2025-09-26, so pin rather than trust `latest` to
# stay stable.
export WORKSHOP_MCP_SERVER_PKG="${WORKSHOP_MCP_SERVER_PKG:-@pulumi/mcp-server@0.2.0}"

say()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
note() { printf '  \033[2m%s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

# mcp_call <method> [params-json] — one request/response round trip against
# the local Pulumi MCP server, via mcp-client.js.
mcp_call() {
  node "$FOLDER_DIR/mcp-client.js" "$@"
}
