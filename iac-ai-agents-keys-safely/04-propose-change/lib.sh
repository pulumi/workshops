#!/usr/bin/env bash
# lib.sh — shared bits for 04-propose-change scripts (sourced, not run).
FOLDER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_STACK_DIR="$(cd "$FOLDER_DIR/../01-base-stack" && pwd)"
SCRATCH_DIR="$FOLDER_DIR/.scratch"

say()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
note() { printf '  \033[2m%s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

# make_scratch_copy — a throwaway copy of 01-base-stack (minus node_modules
# and any local state) that a proposal's patch can be applied to without
# touching the real project directory.
make_scratch_copy() {
  rm -rf "$SCRATCH_DIR"
  mkdir -p "$SCRATCH_DIR/01-base-stack"
  ( cd "$BASE_STACK_DIR" && find . -mindepth 1 -maxdepth 1 \
      ! -name node_modules ! -name .state \
      -exec cp -a {} "$SCRATCH_DIR/01-base-stack/" \; )
  ln -s "$BASE_STACK_DIR/node_modules" "$SCRATCH_DIR/01-base-stack/node_modules"
}
