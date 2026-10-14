#!/usr/bin/env bash
# Step 6: add the deployer tuple for agent:deploy-bot to the Pulumi program.
# It uncomments the GRANT line in 01-stack/tuples.py; then run `pulumi up`.
set -euo pipefail

tuples="$(dirname "${BASH_SOURCE[0]}")/../01-stack/tuples.py"
if ! grep -q '^    # GRANT ' "$tuples"; then
  echo "grant line already active (or missing) in $tuples" >&2
  exit 1
fi
sed 's/^    # GRANT /    /' "$tuples" > "$tuples.tmp" && mv "$tuples.tmp" "$tuples"
echo "granted: agent:deploy-bot is now a deployer of stack:production in 01-stack/tuples.py"
echo "next: cd 01-stack && pulumi up"
