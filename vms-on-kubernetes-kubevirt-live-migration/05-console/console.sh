#!/usr/bin/env bash
# console.sh — open an interactive serial console into the running demo VM.
#
#   05-console/console.sh [vm-name]     # defaults to demo-vm
#
# virtctl's own console command prints "Press Ctrl+] or Ctrl+5 to exit
# console." on attach (see kubevirt/pkg/virtctl/console/console.go); Ctrl+]
# is also the documented escape used throughout the KubeVirt user guide's
# "Accessing the Serial Console" section
# (https://kubevirt.io/user-guide/user_workloads/accessing_virtual_machines/).
# Confirm this against `virtctl console --help` on the day, since the
# in-console banner is the authoritative source, not this comment.
set -uo pipefail
# shellcheck source=../01-preflight/lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../01-preflight/lib.sh"

vm_name="${1:-demo-vm}"

# This build workstation has no virtctl installed, so this script could not
# be executed here; it is shellcheck-clean and ready to run against a real
# cluster.
have virtctl || die "virtctl is not installed or not on PATH — install the version matching this workshop's KubeVirt pin (v1.9.0) before the session"

say "attaching to the serial console of '$vm_name' (exit with Ctrl+])"
exec virtctl console "$vm_name"
