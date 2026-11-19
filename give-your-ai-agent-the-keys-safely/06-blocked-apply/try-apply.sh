#!/usr/bin/env bash
# try-apply.sh -- show the apply being refused at two independent layers,
# without applying anything for real:
#   1. Proxy layer (run for real, below): a pulumi-cli-up call routed through
#      03-scoped-access/guard.mjs is blocked before it ever reaches the real
#      @pulumi/mcp-server, because pulumi-cli-up is not in the proxy's
#      read-plus-propose allow-list.
#   2. Token layer (documented, defense in depth): even a pulumi-cli-up call
#      that somehow bypassed the proxy runs under a Pulumi Cloud organization
#      token whose "Stack Read" role carries no stack:write scope, so Pulumi
#      Cloud itself refuses the update. See 03-scoped-access/AGENTS.md for
#      the full rationale.
set -uo pipefail

say() {
    printf '\n=== %s ===\n' "$1"
}

cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

say "Attempt 1 (proxy layer): pulumi-cli-up routed through 03-scoped-access/guard.mjs"
output="$(node ../02-mcp-server/probe.mjs --call pulumi-cli-up --args '{"workDir":"../01-base-stack","stackName":"dev"}' -- node ../03-scoped-access/guard.mjs 2>&1)"
probe_exit=$?
echo "$output"
echo "exit=$probe_exit  (0: the transport itself worked -- the block is a well-formed JSON-RPC error, not a crash)"

if echo "$output" | grep -q 'blocked by workshop guard'; then
    echo "BLOCKED as expected (proxy layer)"
else
    echo "NOT BLOCKED -- investigate"
fi

say "Attempt 2 (token layer, defense in depth): a genuine read-only Pulumi Cloud token"
# Not executed in this build: this workstation has no Pulumi Cloud
# credentials. A presenter must run this with a real read-only token before
# the live session to confirm the refusal.
#
# What a presenter runs, bypassing the proxy entirely -- this is a direct CLI
# call, not routed through guard.mjs or the MCP protocol at all -- to show
# the second, independent layer:
#
#   cd ../01-base-stack && PULUMI_ACCESS_TOKEN=<read-only org token> pulumi up --stack dev --yes
#
# Reproduced below as a real command guarded on PULUMI_ACCESS_TOKEN actually
# being set, rather than the placeholder form above: a literal
# `<read-only org token>` would trip the shell's own redirection operators,
# and running `pulumi up` with no credential at all would not demonstrate
# the token-scope refusal this attempt exists to show. Export
# PULUMI_ACCESS_TOKEN to a genuine read-only organization token before
# running this script if you want this attempt to execute for real.
if [ -z "${PULUMI_ACCESS_TOKEN:-}" ]; then
    echo "SKIPPED: PULUMI_ACCESS_TOKEN is not set in this environment."
    echo "Do not treat this skip as a pass -- it means the refusal below has not been confirmed here."
else
    (cd ../01-base-stack && pulumi up --stack dev --yes)
    echo "exit=$?  (expected: non-zero -- Pulumi Cloud refuses; the token's Stack Read role has no stack:write scope)"
fi
