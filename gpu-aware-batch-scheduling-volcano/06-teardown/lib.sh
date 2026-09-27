#!/usr/bin/env bash
# lib.sh — shared bits for the teardown scripts (sourced, not run).
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

say()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
note() { printf '  \033[2m%s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

# destroy_project <dir> — pulumi destroy in that project if it has a stack.
destroy_project() {
  local dir="$1"
  ( cd "$WORKSHOP_DIR/$dir" || exit 1
    if pulumi stack --show-name >/dev/null 2>&1; then
      say "destroying $dir"
      pulumi destroy --yes
    else
      note "$dir: no active stack, skipping"
    fi
  )
}
