#!/usr/bin/env bash
set -euo pipefail
# Run from any step folder (02 to 09) of the deployed project, inside `pulumi env run`:
#   pulumi env run <org>/aws-eventbridge-patterns/dev -- ../02-bus-and-rule/replay.sh [minutes-back]
STACK="${STACK:-dev}"
REGION="${AWS_REGION:-eu-central-1}"
out() { pulumi stack output "$1" --stack "$STACK"; }

# Replays archived events into the order.created rule only (FilterArns), via the CLI:
# the Pulumi AWS provider has no replay resource.
MINUTES_BACK="${1:-60}"
BUS_ARN="$(out busArn)"
ARCHIVE_ARN="$(out archiveArn)"
RULE_ARN="$(out createdRuleArn)"
START="$(date -u -d "-${MINUTES_BACK} minutes" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-"${MINUTES_BACK}"M +%Y-%m-%dT%H:%M:%SZ)"
END="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
NAME="workshop-replay-$(date +%s)"
aws events start-replay --region "$REGION" \
    --replay-name "$NAME" \
    --event-source-arn "$ARCHIVE_ARN" \
    --event-start-time "$START" --event-end-time "$END" \
    --destination "Arn=$BUS_ARN,FilterArns=$RULE_ARN"
aws events describe-replay --region "$REGION" --replay-name "$NAME" --query '{state: State, reason: StateReason}'
