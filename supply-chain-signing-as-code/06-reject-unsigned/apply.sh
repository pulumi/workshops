#!/usr/bin/env bash
# apply.sh — demo step 7: apply a second manifest referencing the unsigned
# image; Kyverno's admission policy should reject it. Prints the rejection
# message so the audience sees exactly why.
#
#   06-reject-unsigned/apply.sh
#
# Needs 04-unsigned-image/push-unsigned.sh already run.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

have kubectl || die "kubectl not found"

REPO_URL="$(pulumi stack output repositoryUrl --cwd "$DIR/../01-platform")"
CONTEXT="$(pulumi stack output clusterContext --cwd "$DIR/../01-platform")"
[[ -n "$REPO_URL" && -n "$CONTEXT" ]] || die "could not read stack outputs from 01-platform"
IMAGE="${REPO_URL}:unsigned"

say "Applying a Pod referencing the unsigned image (${IMAGE})"
note "expect this command to fail — that failure is the demo"
if sed "s|__IMAGE__|${IMAGE}|" "$DIR/pod.yaml.tmpl" | kubectl --context "$CONTEXT" apply -f -; then
  die "the unsigned image was admitted — check the ClusterPolicy in 01-platform/index.ts"
else
  note "kubectl's own output above is Kyverno's admission-webhook rejection message"
fi
