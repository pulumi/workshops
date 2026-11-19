#!/usr/bin/env bash
# Once per project: enable the APIs the demo uses.
# Usage: GCP_PROJECT_ID=my-project ./enable-apis.sh
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

require gcloud
require_var GCP_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  --project "$GCP_PROJECT_ID"
