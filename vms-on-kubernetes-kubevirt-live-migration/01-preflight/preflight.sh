#!/usr/bin/env bash
# preflight.sh — run on the host before the demo. Checks that this machine can
# actually run KubeVirt on a local kind cluster, and reports the tool
# versions the runbook expects. Read-only; fixes nothing.
#
#   01-preflight/preflight.sh
set -uo pipefail
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

# (a) Host OS. KubeVirt's nested-virtualization path needs a Linux host with
# KVM (or software emulation); it is not supported on macOS or Windows hosts,
# docker-desktop included. See https://github.com/kubevirt/kubevirt/issues/12410
os="$(uname -s)"
if [ "$os" = "Linux" ]; then
  say "host OS: Linux (OK)"
else
  die "host OS is '$os', not Linux — KubeVirt on kind is not supported on macOS or Windows hosts (https://github.com/kubevirt/kubevirt/issues/12410)"
fi

# (b) Docker installed and daemon reachable.
have docker || die "docker is not installed or not on PATH"
if docker info >/dev/null 2>&1; then
  say "docker daemon reachable"
else
  die "docker is installed but the daemon is not reachable (is it running?)"
fi

# (c) /dev/kvm — hardware virtualization. Not fatal without it, just slower.
if [ -e /dev/kvm ]; then
  say "/dev/kvm present (hardware-accelerated virtualization)"
else
  say "WARNING: /dev/kvm not found — KubeVirt will fall back to software emulation (qemu TCG), which is noticeably slower for boot and migration"
fi

# (d) Docker memory budget. Best-effort: some docker builds don't expose
# MemTotal in `docker info --format`, so a failure to parse is a warning, not
# a hard gate.
mem_bytes="$(docker info --format '{{.MemTotal}}' 2>/dev/null || true)"
if [ -n "$mem_bytes" ] && [ "$mem_bytes" -gt 0 ] 2>/dev/null; then
  mem_gib=$((mem_bytes / 1024 / 1024 / 1024))
  if [ "$mem_gib" -ge 8 ]; then
    say "docker memory budget: ${mem_gib}GiB (OK, >= 8GiB)"
  else
    say "WARNING: docker memory budget is only ${mem_gib}GiB — 8GiB or more is recommended for kind + KubeVirt + a running VM"
  fi
else
  say "WARNING: could not determine docker's memory budget from 'docker info --format {{.MemTotal}}' — check Docker Desktop's resource settings manually (8GiB or more recommended)"
fi

# (e) Presenter-convenience tool checks. None of these are a hard gate here:
# a build workstation may legitimately lack kind/kubectl/virtctl, and the
# actual gate is whichever Pulumi program needs them.
if have kind; then
  say "kind: $(kind version 2>/dev/null | head -n1)"
else
  say "WARNING: kind not found on PATH"
fi

if have kubectl; then
  kubectl_version="$(kubectl version --client 2>/dev/null | head -n1)"
  say "kubectl: ${kubectl_version:-installed, version unknown}"
else
  say "WARNING: kubectl not found on PATH"
fi

if have virtctl; then
  virtctl_version="$(virtctl version --client 2>/dev/null | head -n1)"
  say "virtctl: ${virtctl_version:-installed, version unknown}"
else
  say "WARNING: virtctl not found on PATH"
fi

say "preflight checks complete"
