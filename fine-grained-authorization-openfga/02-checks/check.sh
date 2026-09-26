#!/usr/bin/env bash
# Runs an OpenFGA Check call against the running stack (../01-stack) and
# prints the result. This is steps 5 and 7 of the demo: the presenter runs
# this once for the deny case, again after the live edit for the allow
# case, and a third time for user:alice as the contrast that never changes.
#
# Usage:
#   ./check.sh <user> <relation> <object>
#
# Examples:
#   ./check.sh agent:deploy-bot can_deploy stack:production   # step 5: deny
#   ./check.sh agent:deploy-bot can_deploy stack:production   # step 6/7: allow, after the live edit + pulumi up
#   ./check.sh user:alice can_deploy stack:production          # step 7: stays allowed throughout
set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "usage: $0 <user> <relation> <object>" >&2
  exit 1
fi

principal=$1
relation=$2
object=$3

stack_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../01-stack" && pwd)"

api_url=$(pulumi stack output api_url --cwd "${stack_dir}")
store_id=$(pulumi stack output store_id --cwd "${stack_dir}")
model_id=$(pulumi stack output authorization_model_id --cwd "${stack_dir}")

payload=$(python3 -c '
import json, sys
principal, relation, obj, model_id = sys.argv[1:5]
print(json.dumps({
    "tuple_key": {"user": principal, "relation": relation, "object": obj},
    "authorization_model_id": model_id,
}))
' "${principal}" "${relation}" "${object}" "${model_id}")

echo "Check: ${principal} ${relation} ${object}"
curl -sS -X POST "${api_url}/stores/${store_id}/check" \
  -H "content-type: application/json" \
  -d "${payload}" \
  | python3 -c "import json, sys; d = json.load(sys.stdin); print('allowed:', d.get('allowed', d))"
