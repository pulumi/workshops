#!/usr/bin/env bash
# init-stacks.sh — once-only setup: create the `dev` stack in the three Pulumi projects and install their packages.
#   01-cluster/init-stacks.sh
set -uo pipefail
# shellcheck source=../04-clients/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../04-clients/lib.sh"
have pulumi || die "pulumi not installed"
have npm || die "npm not installed"
for d in 01-cluster 02-kafka 03-topic; do
  say "$d: npm install, stack init $STACK"
  (cd "$WORKSHOP_DIR/$d" && npm install --no-audit --no-fund && { pulumi stack select "$STACK" 2>/dev/null || pulumi stack init "$STACK"; }) || die "setup failed in $d"
done
