#!/usr/bin/env bash
# Shared helpers for the drift and teardown scripts. Source this file; do not run it.
#
# Set ESC_ENV to <org>/tf-modules-gitops/aws-oidc to run every AWS call
# through `pulumi env run`, so no AWS key is needed in your shell. Without
# ESC_ENV the scripts use whatever AWS credentials your shell already has.

# shellcheck disable=SC2034  # REGION is read by the scripts that source this file
REGION="${AWS_REGION:-us-west-2}"

aws_cmd() {
  if [[ -n "${ESC_ENV:-}" ]]; then
    pulumi env run "${ESC_ENV}" -- aws "$@"
  else
    aws "$@"
  fi
}
