#!/usr/bin/env bash
# Change the security group outside Pulumi: add a tag with the AWS CLI.
# The workshop does the same thing by hand in the AWS console; this is the
# scripted version for a replay. Run it from the project directory (the copy of 06-push-to-deploy).
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "${here}/lib.sh"

sg_id="$(pulumi stack output securityGroupId)"
echo "Adding tag ConsoleChange=true to ${sg_id} outside Pulumi"
aws_cmd ec2 create-tags --region "${REGION}" --resources "${sg_id}" --tags Key=ConsoleChange,Value=true
echo "Done. Now run: bash ../07-drift/detect-drift.sh"
