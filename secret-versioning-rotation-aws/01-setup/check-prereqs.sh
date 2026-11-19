#!/usr/bin/env bash
# Step 1: check the tools and the logins the demo needs before anything is created.
set -euo pipefail

fail=0
need() {
  if command -v "$1" >/dev/null 2>&1; then
    echo "ok       $1"
  else
    echo "MISSING  $1"
    fail=1
  fi
}

for tool in pulumi aws node npm jq; do need "$tool"; done

echo "--- Pulumi Cloud"
pulumi whoami || fail=1

echo "--- AWS"
aws sts get-caller-identity --query Arn --output text || fail=1

node_major=$(node --version | sed 's/^v//; s/\..*//')
if [ "$node_major" -lt 22 ]; then
  echo "Node.js 22 or newer is required, found $(node --version)"
  fail=1
fi

exit "$fail"
