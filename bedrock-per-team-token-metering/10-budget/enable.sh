#!/usr/bin/env bash
# Step 10 (optional): add an AWS Budget filtered by the Team tag.
# The Team tag must already be activated as a cost allocation tag in the Billing console
# (up to 24 hours), and spend appears up to 24 hours after that, so the talk shows this pre-baked.
# Usage: BUDGET_EMAIL=you@example.com ./enable.sh
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi
[ -n "${BUDGET_EMAIL:-}" ] || die "set BUDGET_EMAIL to the notification recipient"
pulumi_stack config set budgetEmail "$BUDGET_EMAIL"
pulumi_stack config set enableBudget true
pulumi_stack up --yes
