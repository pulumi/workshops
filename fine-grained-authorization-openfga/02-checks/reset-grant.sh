#!/usr/bin/env bash
# Between runs: comment the deployer tuple out again so step 5 shows a deny.
set -euo pipefail

tuples="$(dirname "${BASH_SOURCE[0]}")/../01-stack/tuples.py"
if grep -q '^    # GRANT ' "$tuples"; then
  echo "grant line already commented out"
  exit 0
fi
sed 's/^    \({"user": "agent:deploy-bot", "relation": "deployer".*\)$/    # GRANT \1/' "$tuples" > "$tuples.tmp" && mv "$tuples.tmp" "$tuples"
echo "reset: deployer tuple commented out in 01-stack/tuples.py"
