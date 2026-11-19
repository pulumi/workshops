#!/usr/bin/env bash
# Step 7: run a command with the secret injected as an environment variable. No AWS key on this machine.
# Usage: ./run-app.sh <pulumi-org>
set -euo pipefail

org=${1:?usage: run-app.sh <pulumi-org>}
# Prints the length only, so the token never lands in the terminal or the slides.
# shellcheck disable=SC2016  # the inner shell expands the variables, on purpose
pulumi env run "$org/secret-rotation/app-secrets" -- \
  bash -c 'echo "APP_TOKEN has ${#APP_TOKEN} characters; APP_TOKEN_PREVIOUS has ${#APP_TOKEN_PREVIOUS}"'
