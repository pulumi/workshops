#!/usr/bin/env bash
# lib.sh — shared bits for 03-agent-client scripts (sourced, not run).
FOLDER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC2034 # used by the sibling script that sources this file
BASE_STACK_DIR="$(cd "$FOLDER_DIR/../01-base-stack" && pwd)"

say()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
note() { printf '  \033[2m%s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }
