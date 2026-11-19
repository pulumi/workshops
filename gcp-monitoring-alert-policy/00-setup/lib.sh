#!/usr/bin/env bash
# Shared helpers for the workshop scripts. Sourced, never run.
set -euo pipefail

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing tool: $1" >&2; exit 1; }
}

require_var() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "set $name first (see README.md)" >&2
    exit 1
  fi
}
