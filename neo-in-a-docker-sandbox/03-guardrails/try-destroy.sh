#!/usr/bin/env bash
# try-destroy.sh — show the delete guardrails from the host, without Neo and
# without risk: the destroy runs as a preview only.
#   1. `pulumi destroy --preview-only` inside the sandbox: the engine refuses,
#      because the bucket has `protect: true` (02-app/index.ts).
#   2. An AWS CLI delete inside the sandbox has no credentials to use: the VM
#      holds none; ESC mints them only for Pulumi runs that import the environment.
# shellcheck disable=SC2016 # single-quoted $HOME is expanded inside the sandbox, on purpose
set -uo pipefail
# shellcheck source=../01-sandbox/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-sandbox/lib.sh"
have sbx || die "sbx not installed"
sandbox_exists || die "sandbox '$SANDBOX' does not exist; run 01-sandbox/up.sh first"

say "pulumi destroy --preview-only inside the sandbox (protect: true on the bucket)"
sbx exec -w "$PROJECT_DIR" "$SANDBOX" sh -c "pulumi destroy --preview-only --stack $STACK"
echo "exit=$?  (non-zero: the engine refused to plan a delete of a protected resource)"

say "an AWS CLI delete inside the sandbox has no credentials to use"
sbx exec "$SANDBOX" sh -c 'aws s3 rb s3://neo-workshop-demo --force'
echo "exit=$?"

note "the teardown belongs on the host: 01-sandbox/reset.sh --destroy (unprotect + destroy)"
