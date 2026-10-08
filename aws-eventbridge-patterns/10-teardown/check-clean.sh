#!/usr/bin/env bash
set -euo pipefail
# After `pulumi destroy`: lists anything the workshop left behind. Exits 1 if something is left.
REGION="${AWS_REGION:-eu-central-1}"
LEFT=0
check() {
    local label="$1" result="$2"
    if [ -n "$result" ] && [ "$result" != "None" ]; then
        echo "LEFT OVER ($label): $result"
        LEFT=1
    else
        echo "clean: $label"
    fi
}
check "event buses named orders" "$(aws events list-event-buses --region "$REGION" --name-prefix orders --query 'EventBuses[].Name' --output text)"
check "archives" "$(aws events list-archives --region "$REGION" --name-prefix orders --query 'Archives[].ArchiveName' --output text)"
check "schedule groups" "$(aws scheduler list-schedule-groups --region "$REGION" --name-prefix orders --query 'ScheduleGroups[].Name' --output text)"
check "queues" "$(aws sqs list-queues --region "$REGION" --queue-name-prefix orders --query 'QueueUrls' --output text)"
check "lambda functions" "$(aws lambda list-functions --region "$REGION" --query "Functions[?starts_with(FunctionName, 'orders-')].FunctionName" --output text)"
check "log groups" "$(aws logs describe-log-groups --region "$REGION" --log-group-name-prefix /aws/lambda/orders- --query 'logGroups[].logGroupName' --output text)"
check "iam roles" "$(aws iam list-roles --query "Roles[?starts_with(RoleName, 'orders-handler-role') || starts_with(RoleName, 'scheduler-role')].RoleName" --output text)"
exit "$LEFT"
