#!/usr/bin/env bash
# Detect drift without changing state or cloud: a preview-only refresh that
# exits non-zero when the cloud no longer matches the stack state.
# Run it from the project directory.
set -uo pipefail

pulumi refresh --preview-only --expect-no-changes
status=$?

if [[ $status -eq 0 ]]; then
  echo "No drift: the stack state matches the cloud."
else
  echo "Drift detected (exit status ${status})."
  echo "Reconcile the cloud to your code with: pulumi up --refresh"
fi
exit "$status"
