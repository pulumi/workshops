#!/usr/bin/env bash
# The stop: the alarm fired, the cutoff function put a Deny on the team role, the team's own
# call fails, and the other team still works. Usage: scripts/check-cutoff.sh [team=search] [other=support]
# Run it after trip-alarm.sh. If the alarm has not fired yet it waits (up to a few minutes),
# printing the state as it goes. Fails if the tripped team can still invoke.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
need pulumi; need aws; need jq
team="${1:-search}"
other="${2:-support}"
role="bedrock-meter-$team"
alarm="bedrock-$team-output-tokens"
profile="$(team_profile_arn "$team")"
threshold="$(team_limit "$team" perMinute)"

alarm_state() {
  aws_admin cloudwatch describe-alarms --region "$REGION" --alarm-names "$alarm" \
    --query 'MetricAlarms[0].StateValue' --output text
}

say "Alarm for $team (threshold: $threshold output tokens in one minute)"
for attempt in $(seq 1 24); do
  state="$(alarm_state)"
  printf '%s  %s\n' "$(date +%H:%M:%S)" "$state"
  [ "$state" = ALARM ] && break
  [ "$attempt" -lt 24 ] || die "the alarm has not fired after 4 minutes; did trip-alarm.sh run?"
  sleep 10
done
aws_admin cloudwatch describe-alarms --region "$REGION" --alarm-names "$alarm" \
  --query 'MetricAlarms[].{alarm:AlarmName,state:StateValue,action:AlarmActions[0]}' --output table

say "The cutoff function ran (its log line)"
for attempt in $(seq 1 12); do
  if aws_admin iam list-role-policies --role-name "$role" --query 'PolicyNames' --output text | grep -q token-cutoff; then
    break
  fi
  [ "$attempt" -lt 12 ] || die "the alarm is in ALARM but no token-cutoff policy appeared on $role after 2 minutes"
  printf 'waiting for the function (attempt %s)\n' "$attempt"; sleep 10
done
aws_admin logs tail /aws/lambda/bedrock-token-cutoff --region "$REGION" --since 30m --format short 2>/dev/null \
  | grep INFO | sed 's/^[^ ]* [^ ]* [^ ]* INFO //' | tail -n 1 || echo "(log line not delivered yet)"

say "Inline policies on $role"
aws_admin iam list-role-policies --role-name "$role" --query 'PolicyNames' --output text

(
  assume_team "$team"
  say "Calling as $team, through its own profile (this should fail now)"
  # The Deny was written seconds ago; IAM can take a few seconds to apply it.
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if ! converse "$profile" "hello" --inference-config '{"maxTokens":20}' --query 'usage' --output json 2>&1; then
      break
    fi
    [ "$attempt" -lt 10 ] || die "the call still succeeds; the cutoff is not in place"
    printf 'still allowed, waiting for IAM (attempt %s)\n' "$attempt"; sleep 3
  done
  say "Denied: the alarm became a stop."
)

other_profile="$(team_profile_arn "$other")"
if [ -n "$other_profile" ] && [ "$other_profile" != null ]; then
  (
    assume_team "$other"
    say "Calling as $other, through its own profile (this still works)"
    converse "$other_profile" "hello" --inference-config '{"maxTokens":20}' --query 'usage' --output json
  )
fi
say "Lift the stop on $team with scripts/restore.sh $team"
