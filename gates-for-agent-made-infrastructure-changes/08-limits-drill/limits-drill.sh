#!/usr/bin/env bash
# limits-drill.sh: where the open-approval gate stops working.
#
#   08-limits-drill/limits-drill.sh explain   # print the limits and the workaround
#   08-limits-drill/limits-drill.sh user      # user-initiated deployment: uses YOUR grant
#
# Source: https://www.pulumi.com/docs/deployments/guides/gated-deployments/
# (read 2026-10-23). The gate sits on the credential environment, not on the
# deployment. A deployment opens the environment as the identity that started it:
#   - User-initiated runs (console Deploy button, REST API, pulumi deployment
#     run) use that user's grant. Get the grant first, then run within it.
#   - Git-push and pull-request deployments run under an ephemeral stack token
#     that cannot hold a pre-approved grant, so the ruleset cannot gate them
#     directly. The documented workaround is a dedicated PULUMI_ACCESS_TOKEN
#     principal whose access you approve ahead of each run.
# Without an active grant the deployment fails at once; it does not wait.
#
# The git-push and pull-request trigger needs a connected repository and
# deployment settings on the stack. That setup is not part of this folder: do
# it in the console with your own repository, push a commit, and watch the
# deployment fail to open the environment.
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

explain() {
  cat <<'EOF'
Limits of the open-approval gate

  1. It gates credential access, not the deployment. The deployment just
     fails when it cannot open the environment.
  2. A run without an active grant fails; it does not wait for approval.
  3. You approve first, then trigger, inside the access duration.
  4. User-initiated deployments use the initiating user's grant.
  5. Git-push and pull-request deployments run with an ephemeral stack token
     and cannot be gated directly.

Workaround for automated deployments: configure the deployment with a
dedicated PULUMI_ACCESS_TOKEN principal, and approve that principal's access
ahead of each run.
EOF
}

case "${1:-}" in
  explain)
    explain
    ;;
  user)
    require_org
    require_cmd pulumi
    info "acting as: $(pulumi whoami)"
    info "queueing an update deployment on $STACK. It opens $(esc_fqn) as you."
    info "with an active grant it runs; without one it fails with an approval error."
    confirm "Queue the deployment now?" || die "cancelled"
    pulumi deployment run update --stack "$STACK" --suppress-stream-logs=false
    ;;
  *)
    die "usage: limits-drill.sh explain|user"
    ;;
esac
