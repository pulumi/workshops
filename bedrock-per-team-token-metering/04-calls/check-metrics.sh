#!/usr/bin/env bash
# Steps 4 and 5: sum the per-team token metrics of the last hour.
# Usage: ./check-metrics.sh [team ...]  (default: search support)
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need pulumi; need aws
teams=("$@"); [ ${#teams[@]} -gt 0 ] || teams=(search support)
start="$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)"; end="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
for team in "${teams[@]}"; do
  for kind in InputTokens OutputTokens; do
    total="$(aws_admin cloudwatch get-metric-statistics --region "$REGION" --namespace "$NAMESPACE" \
      --metric-name "$team-$kind" --start-time "$start" --end-time "$end" --period 3600 --statistics Sum \
      --query 'Datapoints[].Sum' --output text | tr '\t' '\n' | awk 'NF{s+=$1} END{if (NR) print s}')"
    printf '%-8s %-13s %s\n' "$team" "$kind" "${total:-no data yet}"
  done
done
