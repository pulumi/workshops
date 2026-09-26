#!/usr/bin/env bash
# verify-clean.sh — confirm nothing from the demo is left running: no kind
# clusters, and no containers whose image belongs to kind or KubeVirt.
#
#   07-teardown/verify-clean.sh
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

have kind || die "kind is not installed or not on PATH"
have docker || die "docker is not installed or not on PATH"

clusters="$(kind get clusters 2>/dev/null || true)"
if [ -n "$clusters" ]; then
  die "kind still lists cluster(s): $clusters — run 'kind delete cluster --name <name>' before continuing"
fi
say "OK: no kind clusters remain"

leftover="$(docker ps --format '{{.Image}}' 2>/dev/null | grep -E 'kindest/node|quay\.io/kubevirt' || true)"
if [ -n "$leftover" ]; then
  die "containers are still running from demo images:
$leftover"
fi
say "OK: no kindest/node or quay.io/kubevirt containers running"

say "clean"
