#!/usr/bin/env bash
set -euo pipefail
# Starts the stop-one-task experiment and waits for it to finish.
# shellcheck source=../lib.sh
source "$(dirname "$0")/../lib.sh"

template_id="$(stack_output stopOneTaskTemplateId)"
experiment_id="$(aws fis start-experiment --experiment-template-id "$template_id" --query 'experiment.id' --output text)"
wait_for_experiment "$experiment_id"
aws ecs list-tasks --cluster "$(stack_output clusterName)" --service-name "$(stack_output serviceName)" --query 'taskArns' --output text
