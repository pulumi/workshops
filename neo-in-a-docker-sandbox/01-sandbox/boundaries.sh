#!/usr/bin/env bash
# boundaries.sh — "what Neo can and can't touch", checked from the host through
# `sbx exec` on the running sandbox. Each block prints what the demo should show.
# shellcheck disable=SC2016 # single-quoted $HOME/$PULUMI_ACCESS_TOKEN are expanded inside the sandbox, on purpose
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
have sbx || die "sbx not installed"
sandbox_exists || die "sandbox '$SANDBOX' does not exist; run 01-sandbox/up.sh first"

x() { sbx exec "$SANDBOX" sh -c "$1"; }

say "1. Identity: the Pulumi CLI runs as your Pulumi user, through the credential proxy"
x 'pulumi whoami -v 2>&1 | sed -n "1,4p"'

say "2. The token never enters the VM"
x 'echo "PULUMI_ACCESS_TOKEN=$PULUMI_ACCESS_TOKEN"'

say "3. No cloud credentials in the VM (ESC mints them at pulumi up time)"
x 'env | grep -E "^(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_SESSION_TOKEN|AWS_PROFILE|GOOGLE_APPLICATION_CREDENTIALS|AZURE_CLIENT_SECRET)=" || echo "(no cloud credential variables)"; ls -a "$HOME/.aws" 2>/dev/null || echo "(no ~/.aws)"'

say "4. Filesystem: the workspace, and nothing else from the repo"
x "ls -d $PROJECT_DIR; echo '--- the folder above it holds only the mount and the kit profile:'; ls $WORKSHOP_DIR 2>&1; echo '--- and the rest of the repo is not here:'; ls $WORKSHOP_DIR/01-sandbox $WORKSHOP_DIR/04-policy 2>&1 | head -n 2; ls /Users 2>&1 | head -n 2"

say "5. Network: what the policy says about each host (the host decides, not the VM)"
sbx policy check network --sandbox "$SANDBOX" ifconfig.me 2>&1 | head -n 3
sbx policy check network --sandbox "$SANDBOX" api.pulumi.com 2>&1 | head -n 3
note "if an unlisted host comes back allowed, this machine is on the Open preset (a '**' rule)"
x 'curl -sS -m 8 https://ifconfig.me 2>&1 | head -n 2 || true'
x 'curl -sS -m 8 -o /dev/null -w "api.pulumi.com -> HTTP %{http_code}\n" https://api.pulumi.com/api/user 2>&1 | head -n 1'

say "6. Host-side proxy log (allowed and blocked hosts, with the matching rule)"
sbx policy log "$SANDBOX" --limit 15
