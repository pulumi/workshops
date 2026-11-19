#!/usr/bin/env bash
# deploy.sh — deploy one stage of the provider stack (demo steps 2, 3 and 4).
#
#   02-provider/deploy.sh cluster   # step 2: EKS cluster only
#   02-provider/deploy.sh backend   # step 3: kbind backend Helm release, phase one
#   02-provider/deploy.sh address   # step 3b: phase two, set externalAddress and callbackUrl
#   02-provider/deploy.sh export    # step 4: CRD, APIServiceExportTemplate, Collection
#
# Each stage sets the stack config flags for that stage, runs pulumi preview, then
# pulumi up (which asks to confirm; KBIND_DEMO_YES=1 skips the prompt).
# The stages build on each other: run them in this order.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

need_org
stage="${1:-}"
S="$ORG/$PROVIDER_STACK"
cd "$PROVIDER_DIR"
[ -d node_modules ] || run npm install

cfg() { run pulumi config set "$1" "$2" --stack "$S"; }
up()  { run pulumi preview --stack "$S"; run pulumi up --stack "$S" ${YES_FLAG[@]+"${YES_FLAG[@]}"}; }

case "$stage" in
  cluster)
    say "step 2: the provider cluster"
    cfg installBackend false
    cfg exportApi false
    up
    ;;
  backend)
    say "step 3: the kbind backend, phase one (no external address yet)"
    cfg installBackend true
    cfg exportApi false
    up
    ;;
  address)
    say "step 3b: phase two, the backend learns its own address"
    host="$(pulumi stack output backendHost --stack "$S")"
    [ -n "$host" ] || die "backendHost is empty. The load balancer has no hostname yet; wait a minute and re-run, or run 'backend' first."
    cfg externalAddress "http://$host"
    up
    ;;
  export)
    say "step 4: export the mangodb API"
    cfg installBackend true
    cfg exportApi true
    up
    ;;
  *) die "usage: deploy.sh cluster|backend|address|export" ;;
esac
