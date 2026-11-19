#!/usr/bin/env bash
set -euo pipefail
# Shows the state changes of the steady-state alarm.
# shellcheck source=../lib.sh
source "$(dirname "$0")/../lib.sh"

aws cloudwatch describe-alarm-history --alarm-name "$(stack_output alarmName)" --history-item-type StateUpdate --max-items 5 \
  --query 'AlarmHistoryItems[].[Timestamp,HistorySummary]' --output text
