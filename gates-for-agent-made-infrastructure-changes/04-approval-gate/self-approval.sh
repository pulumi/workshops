#!/usr/bin/env bash
# self-approval.sh: single-identity variant for participants who have only one
# Pulumi account. One person plays both agent and reviewer.
#
#   04-approval-gate/self-approval.sh
#
# What you give up: the gate no longer separates the requester from the
# approver. It still forces a written reason, a time-boxed grant and an audit
# record, but nobody else has looked at the change. Say so out loud.
#
# Turning self-approval on is a ruleset setting in the console (no CLI or API
# route in the docs read 2026-10-23). This script prints the step, waits for
# you, then files the request as the same user.
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org

cat <<EOF
Console step: environment $(esc_fqn)
  Settings > Approval Rulesets > open the Open ruleset > allow self-approval > save.
EOF

confirm "Self-approval is enabled on the ruleset?" || die "enable self-approval first"

REASON="${REASON:-Single-identity run: I request access and I approve it}" \
  "$(dirname "${BASH_SOURCE[0]}")/request-open.sh"

info "now approve and apply the request yourself: run 05-review-and-apply/review-steps.sh for the steps."
