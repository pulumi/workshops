#!/usr/bin/env bash
# Step 2: publish the policy pack to Pulumi Cloud and enable it.
# Policy groups need a Pulumi Cloud edition that supports them. Without one,
# skip this script and pass the pack to each run (see 03-agent-change/agent.sh,
# POLICY_PACK_DIR).
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

require_cmd pulumi python3
require_org

cd "$(folder_dir 02-policy-pack)"
python3 -m venv venv
venv/bin/pip install -q -r requirements.txt

info "Publishing agent-gates-s3 to $ORG"
pulumi policy publish "$ORG"

GROUP="${POLICY_GROUP:-}"   # empty: the org's default policy group
echo "Enabling $ORG/agent-gates-s3 (latest) in policy group: ${GROUP:-default}"
if confirm "Enable the pack?"; then
  if [[ -n "$GROUP" ]]; then
    pulumi policy enable "$ORG/agent-gates-s3" latest --policy-group "$GROUP"
  else
    pulumi policy enable "$ORG/agent-gates-s3" latest
  fi
fi
