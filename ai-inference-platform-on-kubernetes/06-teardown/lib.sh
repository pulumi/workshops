#!/usr/bin/env bash
# Shared helpers for 06-teardown scripts. Sourced, not executed directly.

# shellcheck disable=SC2034 # used by the scripts that source this file
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

say() {
  printf '\033[1;34m==>\033[0m %s\n' "$1"
}

die() {
  printf '\033[1;31merror:\033[0m %s\n' "$1" >&2
  exit 1
}
