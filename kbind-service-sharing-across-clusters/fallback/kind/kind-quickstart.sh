#!/usr/bin/env bash
# kind-quickstart.sh — the fallback when AWS or EKS is not available: the same flow on two local kind clusters.
#
#   fallback/kind/kind-quickstart.sh   # kubectl bind dev create, then prints the next commands
#
# Uses the project's own `kubectl bind dev create` (documented in the v0.8.1
# quickstart, marked experimental in the CLI). Needs Docker running, kind, kubectl,
# the kubectl-bind plugin (06-bind/install-plugin.sh) and a hosts entry for
# kube-bind.dev.local, which the command offers to add. No Pulumi, no AWS.
# Writes kind-provider.kubeconfig and kind-consumer.kubeconfig into .state/kind.
# The backend image comes from the chart default. If that image is not pullable
# (see README, Open points), this fallback may fail the same way the EKS flow would
# without the repository override.
# shellcheck source=../../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../../01-stacks-and-esc/lib.sh"
set -euo pipefail

have docker || die "docker not found"
have kind || die "kind not found. https://kind.sigs.k8s.io/"
have kubectl-bind || die "kubectl-bind not found. Run 06-bind/install-plugin.sh first."

mkdir -p "$STATE_DIR/kind"
cd "$STATE_DIR/kind"
say "two kind clusters with the kbind backend on the provider"
run kubectl bind dev create

say "next"
cat <<EOF
  kubectl bind login http://kube-bind.dev.local:8080
  KUBECONFIG=$STATE_DIR/kind/kind-consumer.kubeconfig kubectl bind --konnector-image $KONNECTOR_IMAGE --konnector-host-alias <docker-ip>:kube-bind.dev.local
  kubectl bind dev example | KUBECONFIG=$STATE_DIR/kind/kind-consumer.kubeconfig kubectl create -f -
  KUBECONFIG=$STATE_DIR/kind/kind-provider.kubeconfig kubectl get mangodbs.mangodb.com -A
EOF
note "<docker-ip> is printed by 'kubectl bind dev create' in its Next Steps."
