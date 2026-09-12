#!/usr/bin/env bash
# try-destroy.sh — trigger the command guard from the host (what Neo would hit
# if it ran `pulumi destroy` through its shell tool). Expected: "guard: blocked",
# exit 2, one new line in the guard log, nothing destroyed.
# shellcheck disable=SC2016 # single-quoted $HOME/$PULUMI_ACCESS_TOKEN are expanded inside the sandbox, on purpose
set -uo pipefail
# shellcheck source=../01-sandbox/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-sandbox/lib.sh"
have sbx || die "sbx not installed"
sandbox_exists || die "sandbox '$SANDBOX' does not exist; run 01-sandbox/up.sh first"

say "sh -c 'pulumi destroy --yes' inside the sandbox (Neo's shell tool runs commands exactly like this)"
sbx exec -w "$PROJECT_DIR" "$SANDBOX" sh -c 'pulumi destroy --yes'
echo "exit=$?  (2 = blocked by the guard)"

say "aws s3 rb (an AWS CLI delete) gets the same treatment"
sbx exec "$SANDBOX" sh -c 'aws s3 rb s3://neo-workshop-demo --force'
echo "exit=$?"

say "the guard log"
sbx exec "$SANDBOX" sh -c 'cat "$HOME/.local/state/neo-sandbox/guard.log"'

say "second layer: even with the guard lifted, the engine refuses to delete a protected resource"
note "try it yourself from the host:  cd 02-app && pulumi destroy   →  'resource … is protected'"
