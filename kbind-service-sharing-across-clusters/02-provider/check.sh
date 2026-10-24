#!/usr/bin/env bash
# check.sh — proof commands for the provider stack.
#
#   02-provider/check.sh cluster   # step 2: 2 Ready nodes on Kubernetes 1.35
#   02-provider/check.sh backend   # step 3: backend pod Running, URL answers
#   02-provider/check.sh export    # step 4: the template is listed
#
# Read-only. Prints each command, runs it and prints the exit code.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -uo pipefail

need_org
S="$PROVIDER_STACK"
rc() { echo "exit=$?  ($1)"; }

case "${1:-}" in
  cluster)
    say "step 2: the provider cluster"
    write_kubeconfig "$S" >/dev/null
    kc "$S" kubectl get nodes; rc "non-zero: no cluster or no credentials"
    note "Expect 2 nodes, STATUS Ready, VERSION v1.35.x."
    ;;
  backend)
    say "step 3: the kbind backend"
    kc "$S" kubectl get pods -n kube-bind; rc "non-zero: backend not installed"
    kc "$S" kubectl get svc backend -n kube-bind; rc "non-zero: service missing"
    url="$(pulumi stack output backendUrl --stack "$ORG/$S" --cwd "$PROVIDER_DIR")"
    echo "backend URL: $url"
    note "A new load balancer takes a few minutes to resolve in DNS; this retries for up to 5 minutes."
    for _ in $(seq 1 30); do
      code="$(curl -s -o /dev/null -w '%{http_code}' "$url/healthz" || true)"
      [ "$code" = "200" ] && break
      sleep 10
    done
    echo "curl $url/healthz -> HTTP $code  (200: the backend answers from outside the cluster)"
    ;;
  export)
    say "step 4: the exported API"
    kc "$S" kubectl get apiserviceexporttemplates; rc "non-zero: kbind CRDs missing"
    kc "$S" kubectl get collections.kube-bind.io; rc "non-zero: kbind CRDs missing"
    kc "$S" kubectl get crd mangodbs.mangodb.com; rc "non-zero: mangodb CRD missing"
    ;;
  *) die "usage: check.sh cluster|backend|export" ;;
esac
