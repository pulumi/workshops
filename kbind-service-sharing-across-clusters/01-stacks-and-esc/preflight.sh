#!/usr/bin/env bash
# preflight.sh — read-only check of everything the demo needs on your laptop.
#
#   01-stacks-and-esc/preflight.sh   # prints ok / FAIL per tool, exits non-zero on any FAIL
#
# Needs: pulumi, node, npm, aws, kubectl, curl, tar. Run `pulumi login` first.
# Nothing here changes any state.
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
set -uo pipefail

ok=0; bad=0
pass() { printf '  ok    %s\n' "$*"; ok=$((ok + 1)); }
fail() { printf '  FAIL  %s\n' "$*"; bad=$((bad + 1)); }

say "pulumi"
if have pulumi; then
  v="$(pulumi version | sed 's/^v//')"
  vergte "$v" "3.200.0" && pass "pulumi $v" || fail "pulumi $v is older than 3.200.0 (needs pulumi env and pulumi config env)"
  pulumi whoami >/dev/null 2>&1 && pass "logged in to Pulumi Cloud as $(pulumi whoami)" || fail "not logged in. Run: pulumi login"
else
  fail "pulumi not found. https://www.pulumi.com/docs/iac/download-install/"
fi
[ -n "$ORG" ] && pass "organization $ORG" || fail "no organization. Run: pulumi org set-default <org>  (or export KBIND_DEMO_ORG)"
[ -n "${KBIND_AWS_ROLE_ARN:-}" ] && pass "KBIND_AWS_ROLE_ARN is set" || fail "KBIND_AWS_ROLE_ARN is not set (IAM role ARN trusted for Pulumi OIDC)"

say "node and npm"
if have node; then
  nv="$(node -v | sed 's/^v//')"
  vergte "$nv" "20.0.0" && pass "node $nv" || fail "node $nv is older than 20"
else
  fail "node not found"
fi
have npm && pass "npm $(npm -v)" || fail "npm not found"

say "cluster tooling"
have aws && pass "aws cli (the EKS kubeconfig calls aws eks get-token)" || fail "aws cli not found"
have kubectl && pass "kubectl" || fail "kubectl not found"
have curl && pass "curl" || fail "curl not found"
have tar && pass "tar" || fail "tar not found"
have jq && pass "jq (optional)" || note "jq not found (optional)"

say "region"
note "every stack and ESC environment is pinned to $AWS_REGION"

say "summary"
echo "  $ok ok, $bad failed"
[ "$bad" -eq 0 ]
