#!/usr/bin/env bash
# Shared helpers, sourced by the step scripts. Not run directly.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# The Pulumi project the later steps read outputs from (the final program of step 6).
PROGRAM_DIR="${PROGRAM_DIR:-$ROOT/06-policy-gate/program}"
export AWS_REGION="${AWS_REGION:-us-east-1}"

stack_output() {
  pulumi stack output "$1" --cwd "$PROGRAM_DIR"
}

# Poll an experiment until it reaches a terminal state and print status and reason.
wait_for_experiment() {
  local id="$1" status reason
  while true; do
    status="$(aws fis get-experiment --id "$id" --query 'experiment.state.status' --output text)"
    echo "experiment $id: $status"
    case "$status" in
      completed|stopped|failed|cancelled) break ;;
    esac
    sleep 5
  done
  reason="$(aws fis get-experiment --id "$id" --query 'experiment.state.reason' --output text)"
  echo "status: $status"
  echo "reason: $reason"
}
