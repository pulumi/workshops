#!/usr/bin/env bash
set -euo pipefail
# Starts the stop-all-tasks experiment. The steady-state alarm should stop it.
# shellcheck source=../lib.sh
source "$(dirname "$0")/../lib.sh"

template_id="$(stack_output stopAllTasksTemplateId)"
experiment_id="$(aws fis start-experiment --experiment-template-id "$template_id" --query 'experiment.id' --output text)"
wait_for_experiment "$experiment_id"
