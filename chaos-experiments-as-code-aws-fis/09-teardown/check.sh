#!/usr/bin/env bash
set -euo pipefail
# Lists what the workshop may have left behind. Every list should be empty.
# shellcheck source=../lib.sh
source "$(dirname "$0")/../lib.sh"

aws ecs list-clusters --query "clusterArns[?contains(@, 'chaos-fis')]" --output text
aws elbv2 describe-load-balancers --query "LoadBalancers[?starts_with(LoadBalancerName, 'chaos-fis')].LoadBalancerArn" --output text
aws fis list-experiment-templates --query 'experimentTemplates[].id' --output text
aws cloudwatch describe-alarms --alarm-name-prefix chaos-fis --query 'MetricAlarms[].AlarmName' --output text
aws logs describe-log-groups --log-group-name-prefix /chaos-fis --query 'logGroups[].logGroupName' --output text
aws iam list-roles --query "Roles[?contains(RoleName, 'fis-role') || contains(RoleName, 'task-execution-role') || contains(RoleName, 'stop-')].RoleName" --output text
