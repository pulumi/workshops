#!/usr/bin/env bash
# export.sh: export audit log events for a time window so timeline.py can map
# them to the workshop steps.
#
#   07-audit-trail/export.sh <start-unix> [end-unix]     # writes audit.json in this folder
#   AGENT_LOGIN=agent-user 07-audit-trail/export.sh 1790000000
#   USER_FILTER= ...  (leave AGENT_LOGIN unset to export every user)
#
# Needs an org admin login (audit logs require Pro or Enterprise). Flags are
# from the pulumi org audit-log list reference (read 2026-10-23), a command
# marked EXPERIMENTAL there: --org, --start-time and --end-time (Unix
# timestamps), --user (login), --all, --output json.
#
# Fallback if the command is missing or changed: Console > Settings > Audit
# Logs > filter by user and time > export. The JSON and CSV exports both work
# with timeline.py (formats: docs/administration/reference/audit-log-formats).
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org
require_cmd pulumi

START="${1:-}"
END="${2:-}"
[ -n "$START" ] || die "usage: export.sh <start-unix> [end-unix]   (e.g. \$(date -d '2 hours ago' +%s) on GNU date)"

OUT="$(dirname "${BASH_SOURCE[0]}")/audit.json"

args=(org audit-log list --org "$ORG" --start-time "$START" --all --output json)
[ -n "$END" ] && args+=(--end-time "$END")
[ -n "${AGENT_LOGIN:-}" ] && args+=(--user "$AGENT_LOGIN")

info "pulumi ${args[*]}"
pulumi "${args[@]}" > "$OUT"
info "wrote $OUT. Next: python3 $(dirname "${BASH_SOURCE[0]}")/timeline.py $OUT"
