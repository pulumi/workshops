#!/usr/bin/env bash
# Step 10: destroy the stack and check that nothing is left.
# Run from the project folder you deployed (03-inline or 04-component) via
# its path: ./07-teardown/teardown.sh 04-component <stack>
# Usage: GCP_PROJECT_ID=my-project ./teardown.sh <project-folder> <stack>
set -euo pipefail
# shellcheck source=../00-setup/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../00-setup/lib.sh"

require pulumi
require gcloud
require_var GCP_PROJECT_ID
require_var PULUMI_ORG

folder="${1:?usage: teardown.sh <project-folder> <stack>}"
stack="${2:?usage: teardown.sh <project-folder> <stack>}"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$here/$folder"
pulumi env run "$PULUMI_ORG/gcp-monitoring-workshop/gcp-oidc" -- pulumi destroy --stack "$stack" --yes
pulumi stack rm "$stack" --yes

# The checks from the brief: both lists must come back empty.
gcloud run services list --project "$GCP_PROJECT_ID" --region europe-west3 --filter "metadata.name:hello-api"
gcloud monitoring policies list --project "$GCP_PROJECT_ID" --filter 'displayName:hello-api'
