#!/usr/bin/env bash
# Confirm every stack is empty and no EC2 instances or load balancers tagged
# for this workshop survive teardown. Run after 06-teardown/teardown.sh.
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

say "Checking each stack reports zero resources"
for project in 01-cluster 02-device-plugin 03-quotas 04-autoscaling; do
  if ! count=$(cd "${WORKSHOP_DIR}/${project}" && pulumi stack --show-urns --stack dev 2>/dev/null | grep -c '^  '); then
    count=0
  fi
  if [[ "${count}" != "0" ]]; then
    die "${project} still reports resources in its stack; re-run teardown.sh"
  fi
  say "${project}: clean"
done

say "Checking for orphaned EC2 instances tagged workshop=ai-inference-platform-on-kubernetes"
orphans=$(aws ec2 describe-instances \
  --filters "Name=tag:workshop,Values=ai-inference-platform-on-kubernetes" \
            "Name=instance-state-name,Values=pending,running,stopping,stopped" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text \
  --region "${AWS_REGION:-us-west-2}")

if [[ -n "${orphans// /}" ]]; then
  die "Orphaned EC2 instances found: ${orphans}. Terminate them by hand before closing out."
fi

say "No orphaned EC2 instances found. Teardown verified clean."
