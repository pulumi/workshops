#!/usr/bin/env bash
# lib.sh — shared bits for the host-side demo scripts (sourced, not run).
# Everything here runs on your laptop, against the local kind cluster.

say()  { printf '[preflight] %s\n' "$*"; }
die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }
