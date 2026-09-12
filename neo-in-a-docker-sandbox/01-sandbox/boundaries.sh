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

say "1. Identity: Neo runs as your Pulumi user, through the credential proxy"
x 'pulumi whoami -v 2>&1 | sed -n "1,4p"'

say "2. The token never enters the VM"
x 'echo "PULUMI_ACCESS_TOKEN=$PULUMI_ACCESS_TOKEN"'

say "3. No cloud credentials in the VM (ESC mints them at pulumi up time)"
x 'env | grep -E "^(AWS_|GOOGLE_|AZURE_)" || echo "(no AWS_/GOOGLE_/AZURE_ variables)"; ls -a "$HOME/.aws" 2>/dev/null || echo "(no ~/.aws)"'

say "4. Filesystem: only the workspace is mounted"
x "ls -d $PROJECT_DIR && ls $WORKSHOP_DIR 2>&1 | head -n 3; ls /Users 2>&1 | head -n 2; ls -a \$HOME | tr '\n' ' '; echo"

say "5. Network: default-deny; an unlisted host is unreachable"
x 'curl -sS -m 8 https://ifconfig.me 2>&1 | head -n 2 || true'
x 'curl -sS -m 8 -o /dev/null -w "api.pulumi.com -> HTTP %{http_code}\n" https://api.pulumi.com/api/user 2>&1 | head -n 1'

say "6. Host-side proxy log (allowed and blocked hosts, with the matching rule)"
sbx policy log "$SANDBOX" --limit 15

say "7. Guard: destructive commands are refused before they run"
x 'pulumi destroy --yes 2>&1 | head -n 4; echo "exit=$?"'
x 'cat "$HOME/.local/state/neo-sandbox/guard.log" 2>/dev/null | tail -n 3'
