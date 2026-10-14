#!/usr/bin/env bash
# Shared helpers for the 02-checks and 03-teardown scripts.

STACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../01-stack" && pwd)"
export API_URL="${OPENFGA_API_URL:-http://localhost:8080}"

# Read a stack output from the current Pulumi stack in 01-stack.
stack_output() {
  (cd "$STACK_DIR" && pulumi stack output "$1")
}
