#!/usr/bin/env bash
# verify.sh — check that nothing from the demo is left in AWS (demo step 9).
#
#   09-teardown/verify.sh   # lists EKS clusters and load balancers in eu-central-1
#
# Read-only. Expect an empty cluster list and no load balancer from the demo. The
# demo provisions an NLB (elbv2); if you set loadBalancerType=clb, check the classic
# list too, so both are printed. The AWS CLI needs credentials: this runs inside
# `pulumi env run` for the provider environment, which survives until cleanup.sh.
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
set -uo pipefail

need_org
env="$(esc_env "$PROVIDER_STACK")"
say "AWS in $AWS_REGION"
run pulumi env run "$env" -- aws eks list-clusters --region "$AWS_REGION"
run pulumi env run "$env" -- aws elbv2 describe-load-balancers --region "$AWS_REGION"
run pulumi env run "$env" -- aws elb describe-load-balancers --region "$AWS_REGION"
note "Expect: clusters [], and no load balancer whose tags or DNS name belong to the demo."
