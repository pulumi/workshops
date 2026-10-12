#!/usr/bin/env bash
set -euo pipefail
# Run from any step folder (02 to 09) of the deployed project, inside `pulumi env run`:
#   pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/send-event.sh <detail-type> [count]
STACK="${STACK:-dev}"
REGION="${AWS_REGION:-eu-central-1}"
out() { pulumi stack output "$1" --stack "$STACK"; }

# Puts <count> events (default 1) with the given detail-type on the bus.
DETAIL_TYPE="${1:?usage: send-event.sh <detail-type> [count]}"
COUNT="${2:-1}"
BUS="$(out busName)"
for i in $(seq 1 "$COUNT"); do
    DETAIL="{\"orderId\": \"order-$(date +%s)-$i\", \"reason\": \"changed my mind\", \"total\": 42}"
    aws events put-events --region "$REGION" --entries \
        "[{\"EventBusName\": \"$BUS\", \"Source\": \"workshop.orders\", \"DetailType\": \"$DETAIL_TYPE\", \"Detail\": $(printf '%s' "$DETAIL" | jq -Rs .)}]"
done
