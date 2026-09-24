#!/usr/bin/env bash
# try-apply.sh — attempt `pulumi up` with the agent's Stack-Read-only token,
# to show the boundary from 03-agent-client holding. This is expected to
# fail: it exits non-zero on purpose. A successful run of this workshop step
# is this script failing, not succeeding.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

[ -n "${PULUMI_ACCESS_TOKEN:-}" ] || die "PULUMI_ACCESS_TOKEN is not set. See ../03-agent-client/AGENTS.md to create a Stack-Read-only organization token — the same token 03-agent-client/verify-scope.sh checks."

have pulumi || die "pulumi CLI is required"

say "Attempting pulumi up with the agent's Stack-Read-only token"
note "This is expected to fail. If it succeeds, the token is scoped too"
note "widely — stop and fix the custom role before continuing the workshop."

cd "$BASE_STACK_DIR"
set +e
pulumi up --yes --stack dev 2>&1 | tee /tmp/workshop-try-apply.log
apply_exit=$?
set -e

if [ "$apply_exit" -eq 0 ]; then
  die "pulumi up succeeded with a Stack-Read-only token. The permission boundary did not hold — check the custom role in the Pulumi console."
fi

say "Blocked, as expected (exit code $apply_exit)."
note "Full output: /tmp/workshop-try-apply.log"
note "Check Pulumi Cloud's audit log for this stack: the denied attempt"
note "should appear as an auth-failure-stack-permission event, not a"
note "Stack Update event"
note "(https://www.pulumi.com/docs/administration/concepts/audit-logs/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)."
exit 0
