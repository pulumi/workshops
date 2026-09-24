#!/usr/bin/env bash
# review-diff.sh <patch-file> — read an agent-proposed diff the way outcome 4
# says a reviewer must: check whether every added resource maps to a real
# requirement, and whether any added resource widens a permission or an
# access surface beyond what the task needed. This is a real, mechanical
# first pass, not a substitute for the group discussion in the README's
# step 5 — it flags what to look at, not a verdict.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
source lib.sh

patch_file="${1:-}"
[ -n "$patch_file" ] || die "usage: $0 <patch-file>  (e.g. ../04-propose-change/logs-bucket.patch)"
[ -f "$patch_file" ] || die "no such file: $patch_file"

say "Reviewing $patch_file"

added_lines="$(grep -E '^\+' "$patch_file" | grep -v '^+++' || true)"

say "Check 1 — does every added resource map to a real requirement?"
note "The ask (see ../04-propose-change/prompt.txt): an access-logs bucket for"
note "the artifact bucket, private, wired up via server access logging."
resource_lines="$(printf '%s\n' "$added_lines" | grep -E 'new aws\.' || true)"
if [ -z "$resource_lines" ]; then
  note "No new resources found in this diff."
else
  printf '%s\n' "$resource_lines" | sed -E 's/^\+[[:space:]]*//' | while IFS= read -r line; do
    printf '  - %s\n' "$line"
  done
  note ""
  note "Reviewer question for each line above: does it exist because the ask"
  note "required it, or did the agent add something nobody asked for? A"
  note "logging-target bucket, its public-access block, and the logging"
  note "config that connects it to the artifact bucket all trace directly to"
  note "the ask above. Anything else on this list should be challenged."
fi

say "Check 2 — does anything here widen a permission or access surface?"
suspect_patterns='new aws\.iam\.|SecurityGroup|0\.0\.0\.0/0|Effect.*Allow|"\*"|new aws\..*Policy\(|blockPublicAcls:[[:space:]]*false|blockPublicPolicy:[[:space:]]*false|restrictPublicBuckets:[[:space:]]*false|ignorePublicAcls:[[:space:]]*false|acl:[[:space:]]*"public'
if suspect="$(printf '%s\n' "$added_lines" | grep -E "$suspect_patterns" || true)" && [ -n "$suspect" ]; then
  note "FLAGGED — lines that touch IAM, security groups, public access, or a wildcard:"
  printf '%s\n' "$suspect" | sed -E 's/^\+[[:space:]]*/  - /'
  note "A proposal that touches any of the above needs explicit sign-off,"
  note "even if the resource itself looks reasonable."
else
  note "No IAM, security-group, public-access, or wildcard changes found."
  note "This proposal does not widen the account's permission or access surface."
fi

say "Reviewer checklist (fill in during the group discussion):"
cat <<'EOF'
  [ ] Every added resource traces to the stated ask (Check 1)
  [ ] No permission or access surface was widened (Check 2)
  [ ] Naming and tags match this workshop's convention
  [ ] The diff is the smallest change that satisfies the ask
  Verdict: approve / reject / ask the agent to redo
EOF
