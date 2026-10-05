#!/usr/bin/env bash
# hold-connection.sh — probe the VM through its NodePort Service while it
# migrates. Every 2 seconds it opens a new TCP connection to the Service
# and reads the SSH banner the guest's sshd sends, so it needs no login and
# no key. A line per probe: OK with the banner, or FAIL.
#
#   06-live-migration/hold-connection.sh
#
# Run it in a second terminal, then trigger the migration with
# 06-live-migration/migrate.sh. A probe opens a new connection each time, so
# this shows the Service answering across the move; it does not keep one
# connection open. A FAIL or two around the switchover is possible and is not
# hidden.
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

have kubectl || die "kubectl is not installed or not on PATH"

svc="${1:-demo-vm-ssh}"
node_port="$(kubectl get svc "$svc" -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)"
[ -n "$node_port" ] || die "could not discover the NodePort for Service '$svc' — check 'kubectl get svc $svc'"

node_ip="$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null)"
[ -n "$node_ip" ] || die "could not discover a node InternalIP — check 'kubectl get nodes -o wide'"

running=1
trap 'running=0' INT TERM

probe() {
  local banner
  exec 3<>"/dev/tcp/$node_ip/$node_port" 2>/dev/null || return 1
  read -r -t 2 banner <&3
  exec 3<&- 3>&-
  [ -n "$banner" ] || return 1
  printf '%s' "$banner"
}

say "probing $node_ip:$node_port ($svc) every 2s — Ctrl+C to stop"
while [ "$running" -eq 1 ]; do
  ts="$(date '+%Y-%m-%dT%H:%M:%S%z')"
  if out="$(probe)"; then
    printf '%s  OK    %s\n' "$ts" "${out%$'\r'}"
  else
    printf '%s  FAIL\n' "$ts"
  fi
  sleep 2
done

say "stopped"
