#!/usr/bin/env bash
# apply.sh — demo step 6: apply a manifest referencing the signed image;
# Kyverno's admission policy should let it through.
#
#   05-admit-signed/apply.sh
#
# Needs 03-sign-and-push/push-and-sign.sh already run.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

have kubectl || die "kubectl not found"

REPO_URL="$(pulumi stack output repositoryUrl --cwd "$DIR/../01-platform")"
CONTEXT="$(pulumi stack output clusterContext --cwd "$DIR/../01-platform")"
[[ -n "$REPO_URL" && -n "$CONTEXT" ]] || die "could not read stack outputs from 01-platform"
IMAGE="${REPO_URL}:signed"

say "Refreshing the ECR pull secret"
ecr_pull_secret "$CONTEXT" "${REPO_URL%%/*}"

say "Applying a Pod referencing the signed image (${IMAGE})"
sed "s|__IMAGE__|${IMAGE}|" "$DIR/pod.yaml.tmpl" | kubectl --context "$CONTEXT" apply -f -

say "Watching admission — expect this to succeed"
kubectl --context "$CONTEXT" get pod hello-signed -w --request-timeout=30s || true

note "if the pod is Running, Kyverno admitted the signed image as expected"
