#!/usr/bin/env bash
# hold-uptime.sh — leave this running in its own terminal during the
# migration, to prove the guest process never restarted: a live migration
# moves the VM's memory and CPU state to another node without rebooting the
# guest, so `uptime` should climb continuously across the migration.
#
#   06-live-migration/hold-uptime.sh
#
# Reuses the same node-IP/NodePort discovery as 05-console/ssh.sh, then reads
# `uptime` non-interactively over SSH every 5 seconds.
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

have kubectl || die "kubectl is not installed or not on PATH"
have ssh || die "ssh is not installed or not on PATH"

node_port="$(kubectl get svc demo-vm-ssh -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)"
[ -n "$node_port" ] || die "could not discover the NodePort for Service 'demo-vm-ssh' — check 'kubectl get svc demo-vm-ssh'"

node_ip="$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null)"
[ -n "$node_ip" ] || die "could not discover a node InternalIP — check 'kubectl get nodes -o wide'"

running=1
trap 'running=0' INT TERM

say "polling uptime on $node_ip:$node_port every 5s — Ctrl+C to stop"
# BatchMode + StrictHostKeyChecking=no are fine here only because this is a
# disposable local kind cluster recreated every session; never use these on
# anything that isn't throwaway infrastructure.
while [ "$running" -eq 1 ]; do
  ts="$(date '+%Y-%m-%dT%H:%M:%S%z')"
  out="$(ssh -o BatchMode=yes -o StrictHostKeyChecking=no "$node_ip" -p "$node_port" uptime 2>&1)"
  printf '%s  %s\n' "$ts" "$out"
  sleep 5
done

say "stopped"
