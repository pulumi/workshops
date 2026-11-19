#!/usr/bin/env bash
# check.sh — proof for a consumer cluster: 2 Ready nodes, and which provider it points at.
#
#   05-consumer/check.sh                    # consumer-a-dev
#   05-consumer/check.sh consumer-b-dev
#
# Read-only.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -uo pipefail

need_org
stack="${1:-$CONSUMER_A_STACK}"
say "consumer cluster $stack"
write_kubeconfig "$stack" >/dev/null
kc "$stack" kubectl get nodes; echo "exit=$?  (non-zero: no cluster or no credentials)"
run pulumi stack output providerUrl --stack "$ORG/$stack" --cwd "$CONSUMER_DIR"
note "Expect 2 Ready nodes and the provider backend URL from the provider stack."
