#!/usr/bin/env bash
# deploy.sh — deploy a consumer cluster (demo steps 5 and 8).
#
#   05-consumer/deploy.sh                    # consumer-a-dev
#   05-consumer/deploy.sh consumer-b-dev     # the second consumer
#
# The provider URL and the consumer name come from the stack's ESC environment
# (it reads the provider stack's backendUrl output), so the provider stack must have
# the backend installed. Runs pulumi preview, then pulumi up (asks to confirm;
# KBIND_DEMO_YES=1 skips the prompt).
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

need_org
stack="${1:-$CONSUMER_A_STACK}"
case "$stack" in consumer-*) ;; *) die "usage: deploy.sh [consumer-a-dev|consumer-b-dev]" ;; esac
[ -n "$(pulumi stack output backendUrl --stack "$ORG/$PROVIDER_STACK" --cwd "$PROVIDER_DIR" 2>/dev/null)" ] \
  || die "the provider stack has no backendUrl yet. Run 02-provider/deploy.sh backend first."

cd "$CONSUMER_DIR"
[ -d node_modules ] || run npm install
say "step 5: consumer cluster $stack"
run pulumi preview --stack "$ORG/$stack"
run pulumi up --stack "$ORG/$stack" ${YES_FLAG[@]+"${YES_FLAG[@]}"}
