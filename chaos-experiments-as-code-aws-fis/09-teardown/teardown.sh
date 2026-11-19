#!/usr/bin/env bash
set -euo pipefail
# Destroys the stack. Refuses to run while an experiment is still running.
# shellcheck source=../lib.sh
source "$(dirname "$0")/../lib.sh"

running="$(aws fis list-experiments --query "experiments[?state.status=='running'].id" --output text)"
if [ -n "$running" ]; then
  echo "experiments still running: $running" >&2
  exit 1
fi
pulumi destroy --cwd "$PROGRAM_DIR"
pulumi stack rm --cwd "$PROGRAM_DIR"
