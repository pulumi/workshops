#!/usr/bin/env bash
# scan.sh — demo steps 8 and 9: run a Kubescape posture scan against the
# cluster and print a summary to walk through with the audience. Grouped in
# one script because step 9 is a reading of step 8's report, not a separate
# action.
#
#   07-kubescape-scan/scan.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib.sh
. "$DIR/../lib.sh"

have kubescape || die "kubescape CLI not found (expected v${KUBESCAPE_VERSION})"

CONTEXT="$(pulumi stack output clusterContext --cwd "$DIR/../01-platform")"
[[ -n "$CONTEXT" ]] || die "could not read clusterContext from 01-platform's stack"

REPORT="$DIR/kubescape-report.json"

say "Scanning the cluster (context: ${CONTEXT})"
kubescape scan --format json --output "$REPORT" --kube-context "$CONTEXT"

say "Summary"
kubescape scan --kube-context "$CONTEXT" | tail -n 20

note "full report at ${REPORT} (gitignored — regenerate it, do not commit it)"
note "step 9: open ${REPORT} and walk through at least one finding — for"
note "example a control flagging the hello-signed/hello-unsigned pods for"
note "running without a resource limit or a non-root securityContext, and"
note "relate it back to the manifests in 05-admit-signed/ and 06-reject-unsigned/"
