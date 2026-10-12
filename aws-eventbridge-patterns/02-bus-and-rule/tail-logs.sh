#!/usr/bin/env bash
set -euo pipefail
# Run from any step folder (02 to 09) of the deployed project, inside `pulumi env run`:
#   pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/tail-logs.sh
STACK="${STACK:-dev}"
REGION="${AWS_REGION:-eu-central-1}"
out() { pulumi stack output "$1" --stack "$STACK"; }

# Streams the Lambda log group. Stop with Ctrl-C.
aws logs tail "$(out logGroupName)" --region "$REGION" --follow --since 10m
