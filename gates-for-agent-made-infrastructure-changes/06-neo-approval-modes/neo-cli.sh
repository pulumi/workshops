#!/usr/bin/env bash
# neo-cli.sh: run the same task prompt through the Pulumi Neo CLI in one
# approval mode. The workshop runs this step in the console; this is the CLI
# equivalent for participants who prefer a terminal.
#
#   06-neo-approval-modes/neo-cli.sh manual    # console name: Review
#   06-neo-approval-modes/neo-cli.sh balanced
#   06-neo-approval-modes/neo-cli.sh readonly  # permission mode read-only, approval mode manual
#
# Flags are from the pulumi neo reference (read 2026-10-23):
#   --approval-mode   manual | balanced | auto (the console calls manual "Review")
#   --permission-mode default | read-only
# The permissions page says approval mode gates pulumi preview, pulumi up and
# opening a pull request (Review), or only pulumi up (Balanced). The reference
# page describes the CLI values less precisely ("prompts on every call"), so
# watch where the CLI pauses and compare with the console runs.
# Auto is deliberately not offered here.
#
# Neo uses your own pulumi login and RBAC, so the open ruleset on the
# credential environment still applies to you.
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org
require_cmd pulumi

MODE="${1:-}"
case "$MODE" in
  manual | balanced) PERMISSION="default" ;;
  readonly) MODE="manual"; PERMISSION="read-only" ;;
  *) die "usage: neo-cli.sh manual|balanced|readonly" ;;
esac

PROGRAM_DIR="${PROGRAM_DIR:-$(folder_dir 01-baseline)}"
PROMPT_FILE="$(dirname "${BASH_SOURCE[0]}")/task-prompt.txt"
[ -f "$PROGRAM_DIR/Pulumi.yaml" ] || die "no Pulumi.yaml in $PROGRAM_DIR; set PROGRAM_DIR to the program folder"

info "approval mode: $MODE, permission mode: $PERMISSION"
pulumi neo \
  --org "$ORG" \
  --stack "$STACK" \
  --cwd "$PROGRAM_DIR" \
  --approval-mode "$MODE" \
  --permission-mode "$PERMISSION" \
  "$(cat "$PROMPT_FILE")"
