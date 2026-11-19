#!/usr/bin/env bash
# ruleset-steps.sh: print the console steps that add the Open approval ruleset
# to the credential environment. Changes nothing.
#
# The CLI and docs pages read for this workshop give no command or API for
# creating an approval ruleset, so this step is a console step.
# Source: https://www.pulumi.com/docs/deployments/guides/gated-deployments/
#   ("Add an Open approval ruleset to the credential environment") and
#   https://www.pulumi.com/docs/esc/concepts/approvals/ (read 2026-10-23).
#
#   04-approval-gate/ruleset-steps.sh
set -euo pipefail
# shellcheck source=../lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_org

cat <<EOF
Add an Open approval ruleset to the environment $(esc_fqn)

  1. Pulumi Cloud console: open the environment (https://app.pulumi.com/${ORG}/esc/${ESC_PROJECT}/${ESC_ENV}).
  2. Settings > Approval Rulesets > Create Ruleset.
  3. Action: Open (not Update).
  4. Approvers: the reviewer account. Required approvals: 1.
  5. Self-approval: off for the two-identity run. Turn it on only for the
     single-identity variant (04-approval-gate/self-approval.sh).
  6. Enable the ruleset.

After this, opening the environment without an active access grant is denied.
That includes the agent's pulumi up and any deployment that opens it.
EOF
