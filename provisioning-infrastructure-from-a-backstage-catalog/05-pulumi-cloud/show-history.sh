#!/usr/bin/env bash
# Step 5 proof: print the resources and update history of the stack the
# Backstage action created, the same data the Pulumi Cloud console shows.
# Usage: ./show-history.sh <org> <bucket-name>
set -euo pipefail

org="${1:?usage: show-history.sh <org> <bucket-name>}"
bucket="${2:?usage: show-history.sh <org> <bucket-name>}"
stack="${org}/backstage-s3-bucket/${bucket}"

pulumi stack --stack "${stack}" --show-urns
pulumi stack history --stack "${stack}"
pulumi console --stack "${stack}"
