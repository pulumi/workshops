#!/usr/bin/env bash
# guard.sh — PATH-shim guard for the neo-sandbox kit.
#
# The shims in ~/.local/bin (pulumi, aws, terraform, tofu) call this script with
# the tool name first, then the original arguments. It matches the argument line
# against destructive.patterns (one `tool|regex` per line, `*` = any tool); on a
# hit it logs the attempt, prints why, and exits 2 without running anything.
# Otherwise it execs the real binary found further down PATH.
#
# Neo runs shell tool calls through `sh -c`, so anything it types resolves
# through these shims. This is a seatbelt against accidents, not a security
# boundary: the agent has sudo inside the VM. The hard boundaries (hypervisor,
# egress allow-list, credential proxy, Pulumi RBAC, `protect: true`) live
# outside this script. A human lifts the guard for one sandbox by creating
# ~/.config/neo-sandbox/allow-destructive (see install-shims.sh / README).
set -uo pipefail

tool="${1:-}"
[ -n "$tool" ] || { echo "guard: usage: guard.sh <tool> [args...]" >&2; exit 64; }
shift

share_dir="${NEO_SANDBOX_SHARE_DIR:-$HOME/.local/share/neo-sandbox}"
shim_dir="${NEO_SANDBOX_SHIM_DIR:-$HOME/.local/bin}"
patterns="$share_dir/destructive.patterns"
allow_file="${NEO_SANDBOX_ALLOW_FILE:-$HOME/.config/neo-sandbox/allow-destructive}"
state_dir="${NEO_SANDBOX_STATE_DIR:-$HOME/.local/state/neo-sandbox}"
log="$state_dir/guard.log"

# Resolve the real tool: the first executable on PATH that is not our shim dir.
real=""
IFS=: read -r -a dirs <<< "${PATH:-}"
for d in "${dirs[@]}"; do
  [ -n "$d" ] || continue
  [ "$d" = "$shim_dir" ] && continue
  if [ -x "$d/$tool" ] && [ ! -d "$d/$tool" ]; then real="$d/$tool"; break; fi
done
if [ -z "$real" ]; then
  echo "guard: cannot find the real '$tool' on PATH (shim dir excluded: $shim_dir)" >&2
  exit 127
fi

args="$*"
if [ ! -f "$allow_file" ] && [ -f "$patterns" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; esac
    t="${line%%|*}"
    re="${line#*|}"
    [ "$t" = "$tool" ] || [ "$t" = "*" ] || continue
    if printf '%s\n' "$args" | grep -Eq -- "$re"; then
      mkdir -p "$state_dir"
      printf '%s BLOCKED %s %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$tool" "$args" >> "$log" 2>/dev/null || true
      cat >&2 <<EOF
guard: blocked a destructive command
  $tool $args
  matched: $re
Nothing was executed. This sandbox blocks commands that tear infrastructure down
so an agent cannot do it by accident. A human can lift the guard for this
sandbox from the host:
  sbx exec <sandbox> sh -c 'mkdir -p ~/.config/neo-sandbox && touch ~/.config/neo-sandbox/allow-destructive'
Blocked attempts are logged in $log.
EOF
      exit 2
    fi
  done < "$patterns"
fi

exec "$real" "$@"
