#!/usr/bin/env bash
# try-egress.sh — show the sandbox network boundary: a host that is not in the
# kit's allow-list is unreachable, and the host-side proxy log says which rule
# blocked it. Expected: curl fails (403 from the proxy or a connection error),
# `sbx policy log` shows the host as blocked.
# shellcheck disable=SC2016 # single-quoted $HOME/$PULUMI_ACCESS_TOKEN are expanded inside the sandbox, on purpose
set -uo pipefail
# shellcheck source=../01-sandbox/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-sandbox/lib.sh"
have sbx || die "sbx not installed"
sandbox_exists || die "sandbox '$SANDBOX' does not exist; run 01-sandbox/up.sh first"

say "an allowed host (Pulumi Cloud API) answers"
sbx exec "$SANDBOX" sh -c 'curl -sS -m 8 -o /dev/null -w "api.pulumi.com -> HTTP %{http_code}\n" https://api.pulumi.com/api/user'

say "an unlisted host does not (the agent cannot exfiltrate to it either)"
sbx exec "$SANDBOX" sh -c 'curl -sS -m 8 https://ifconfig.me; echo "exit=$?"'
sbx exec "$SANDBOX" sh -c 'curl -sS -m 8 -o /dev/null -w "s3.us-west-2.amazonaws.com -> HTTP %{http_code}\n" https://s3.us-west-2.amazonaws.com/; echo "exit=$?"'

say "host-side proxy log"
sbx policy log "$SANDBOX" --limit 20
