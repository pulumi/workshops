#!/usr/bin/env bash
set -euo pipefail
# Run from any step folder (02 to 09) of the deployed project, inside `pulumi env run`:
#   pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/read-queue.sh <stack-output-name>
STACK="${STACK:-dev}"
REGION="${AWS_REGION:-eu-central-1}"
out() { pulumi stack output "$1" --stack "$STACK"; }

# Reads (and does not delete) messages from the queue named by a stack output:
# cancelledQueueUrl in step 3, dlqUrl from step 4 on.
OUTPUT_NAME="${1:?usage: read-queue.sh <stack-output-name>}"
aws sqs receive-message --region "$REGION" --queue-url "$(out "$OUTPUT_NAME")" \
    --max-number-of-messages 10 --wait-time-seconds 5 --message-attribute-names All \
    --attribute-names All
