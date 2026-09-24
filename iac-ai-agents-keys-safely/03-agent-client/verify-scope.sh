#!/usr/bin/env bash
# verify-scope.sh — confirm the agent's token can read the stack (preview)
# but do not attempt a write here; 06-blocked-apply is where a write is
# attempted and expected to fail. This script requires a real
# PULUMI_ACCESS_TOKEN scoped to Stack Read on 01-base-stack; it cannot run
# to completion without one (see AGENTS.md in this folder).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

say "Checking the agent's Pulumi Cloud identity and scope"

[ -n "${PULUMI_ACCESS_TOKEN:-}" ] || die "PULUMI_ACCESS_TOKEN is not set. See AGENTS.md in this folder to create a Stack-Read-only organization token."

have pulumi || die "pulumi CLI is required"

whoami_json="$(pulumi whoami --json 2>&1)" || die "pulumi whoami failed: $whoami_json"
note "Authenticated as: $(printf '%s' "$whoami_json" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(d.user||d.organizations||JSON.stringify(d));')"

say "Confirming the token can read the stack (preview)"
cd "$BASE_STACK_DIR"
if pulumi preview --stack dev >/tmp/workshop-verify-scope-preview.log 2>&1; then
  note "preview succeeded — Stack Read is present, as expected."
else
  note "preview did not succeed; see /tmp/workshop-verify-scope-preview.log."
  note "If the failure names a permission (not a credential problem), the token is scoped too narrowly even for read; check the custom role."
fi

note "This script deliberately does not attempt pulumi up. See 06-blocked-apply/try-apply.sh for that."
