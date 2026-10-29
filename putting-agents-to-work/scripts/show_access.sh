#!/usr/bin/env bash
# Show, live, what each ESC environment can and can't do in AWS.
#
#   scripts/show_access.sh <esc-project>            e.g. feedback-agents
#   scripts/show_access.sh <org>/<esc-project>      e.g. acme/feedback-agents
#
# The argument is everything before /read, /dev-deploy, /prod-deploy: the same
# prefix you use with `pulumi env run`.
#
# Runs the same harmless write (putting one marker item into a table) under
# each environment, against the dev and prod tables. Expected:
#
#   read-only        -> dev: DENIED   prod: DENIED
#   dev-deploy  -> dev: ALLOWED  prod: DENIED
#   prod-deploy -> prod: ALLOWED before the approval ruleset exists,
#                  DENIED (approval required) after it does
#
# Presenter-only. Agents don't run this.
set -uo pipefail
 
prefix="${1:?usage: show_access.sh <esc-project> or <org>/<esc-project>  (e.g. feedback-agents)}"
dev_table="$(pulumi stack output --stack dev table_name)" || { echo "can't read dev stack outputs"; exit 1; }
prod_table="$(pulumi stack output --stack prod table_name 2>/dev/null)" || prod_table=""
item='{"id":{"S":"access-demo"},"message":{"S":"written during the access demo"}}'
 
try() {
  local env="$1" table="$2" label="$3" out reason
  if [[ -z "$table" ]]; then
    printf '  %-12s -> %-5s table: SKIPPED (no %s stack outputs)\n' "$env" "$label" "$label"
    return
  fi
  if out="$(pulumi env run "$prefix/$env" -- \
      aws dynamodb put-item --table-name "$table" --item "$item" 2>&1)"; then
    printf '  %-12s -> %-5s table: ALLOWED\n' "$env" "$label"
  elif grep -q 'AccessDenied' <<<"$out"; then
    printf '  %-12s -> %-5s table: DENIED by AWS IAM\n' "$env" "$label"
  elif grep -qi 'approv\|access grant\|open request' <<<"$out"; then
    printf '  %-12s -> %-5s table: DENIED by ESC (approval required)\n' "$env" "$label"
  else
    # Not an expected denial: show the real error so it can be fixed.
    reason="$(grep -v '^\s*$' <<<"$out" | tail -1)"
    printf '  %-12s -> %-5s table: ERROR: %s\n' "$env" "$label" "$reason"
  fi
}
 
echo "Same command, different credentials ($prefix/*):"
try read-only        "$dev_table"  dev
try read-only        "$prod_table" prod
try dev-deploy       "$dev_table"  dev
try dev-deploy       "$prod_table" prod
try prod-deploy      "$prod_table" prod