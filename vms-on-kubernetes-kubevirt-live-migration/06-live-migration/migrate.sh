#!/usr/bin/env bash
# migrate.sh — trigger live migration of the demo VM to another node.
#
#   06-live-migration/migrate.sh [vm-name]     # defaults to demo-vm
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

vm_name="${1:-demo-vm}"

# This build workstation has no virtctl installed, so this script could not
# be executed here; it is shellcheck-clean and ready to run against a real
# cluster.
have virtctl || die "virtctl is not installed or not on PATH — install the version matching this workshop's KubeVirt pin (v1.9.0) before the session"

say "triggering live migration of '$vm_name'"
virtctl migrate "$vm_name"
