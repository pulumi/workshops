#!/usr/bin/env bash
# bind.sh — bind a consumer cluster to the provider's exported API (demo step 6).
#
#   06-bind/bind.sh                    # consumer-a-dev
#   06-bind/bind.sh consumer-b-dev     # used by step 8
#
# Runs, against the consumer cluster:
#   kubectl bind login <backend URL>
#   kubectl bind --konnector-image ghcr.io/kbind-dev/konnector:v0.8.1
# Both open a browser on this machine. Sign in on the embedded OIDC page (it accepts
# any credentials; it is a development-only server) and select the `mangodb` template.
# --konnector-image points the konnector at the kbind-dev registry: the default image
# path in v0.8.1 (ghcr.io/kube-bind/konnector) is not pullable. The flag is hidden in
# --help. Needs 06-bind/install-plugin.sh first.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -euo pipefail

need_org
stack="${1:-$CONSUMER_A_STACK}"
have kubectl-bind || die "kubectl-bind not found. Run 06-bind/install-plugin.sh first."
url="$(pulumi stack output backendUrl --stack "$ORG/$PROVIDER_STACK" --cwd "$PROVIDER_DIR")"
[ -n "$url" ] || die "provider backendUrl is empty"
write_kubeconfig "$stack" >/dev/null

say "step 6: bind $stack to $url"
note "sign in on the embedded OIDC page, then select the mangodb template"
kc "$stack" kubectl bind login "$url"
kc "$stack" kubectl bind --konnector-image "$KONNECTOR_IMAGE"
