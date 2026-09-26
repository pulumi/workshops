#!/usr/bin/env bash
# verify-teardown.sh — step 8 of the demo.
#
# Run `pulumi destroy` in ../01-stack first (tuples, then the model, then
# the store, then the container, in reverse dependency order), then run
# this to confirm nothing was left behind: no OpenFGA container, and the
# stack's own outputs are gone.
#
#   cd 01-stack && pulumi destroy --yes && cd ..
#   03-teardown/verify-teardown.sh
set -euo pipefail

stack_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../01-stack" && pwd)"

echo "Checking for a leftover OpenFGA container..."
if docker ps -a --filter "name=pulumi-workshop-openfga" --format '{{.Names}}' | grep -q .; then
  echo "FAIL: container pulumi-workshop-openfga still exists" >&2
  docker ps -a --filter "name=pulumi-workshop-openfga"
  exit 1
fi
echo "OK: no pulumi-workshop-openfga container remains."

echo "Checking the stack has no outputs left..."
if pulumi stack output --cwd "${stack_dir}" --json | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if not d else 1)"; then
  echo "OK: stack outputs are empty."
else
  echo "FAIL: stack still reports outputs after destroy" >&2
  pulumi stack output --cwd "${stack_dir}"
  exit 1
fi

echo "Teardown verified clean."
