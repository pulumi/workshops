#!/usr/bin/env bash
# check.sh — proof that the binding exists on the consumer (demo step 6).
#
#   06-bind/check.sh                    # consumer-a-dev
#   06-bind/check.sh consumer-b-dev
#
# Read-only. The konnector pod runs in the kube-bind namespace; the binding and the
# mangodb CRD are what the participant should see.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -uo pipefail

need_org
stack="${1:-$CONSUMER_A_STACK}"
say "binding on $stack"
kc "$stack" kubectl get pods -n kube-bind; echo "exit=$?  (non-zero: konnector not installed)"
kc "$stack" kubectl get apiservicebindings -n kube-bind; echo "exit=$?  (non-zero: kbind CRDs missing)"
kc "$stack" kubectl get crd mangodbs.mangodb.com; echo "exit=$?  (non-zero: the API was not bound)"
