#!/usr/bin/env bash
# preflight.sh — run on the host before the demo. Checks the tools, versions and
# secrets the runbook needs and tells you what is missing. Read-only.
set -uo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ok=0; bad=0
pass() { printf 'ok    %s\n' "$*"; ok=$((ok+1)); }
fail() { printf 'FAIL  %s\n' "$*"; bad=$((bad+1)); }

say "sbx (Docker Sandboxes CLI)"
if have sbx; then
  v="$(sbx version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1)"
  if [ -n "$v" ] && vergte "$v" "0.42.0"; then pass "sbx $v (>= 0.42.0: kit refs as the agent positional, kit args)"; else fail "sbx >= 0.42.0 required, found '${v:-none}'  (brew install docker/tap/sbx)"; fi
  if sbx version 2>/dev/null | grep -qi 'server'; then pass "sbx daemon reachable"; else note "could not read the server version from 'sbx version' (run 'sbx setup' if the daemon is not running)"; fi
  if sbx policy ls >/dev/null 2>&1; then pass "global network policy initialized (sbx policy ls)"; else fail "run 'sbx policy init balanced' once (the kit's allow-list applies on top)"; fi
  if sbx secret ls 2>/dev/null | grep -qi 'pulumi'; then pass "pulumi secret bound (sbx secret ls)"; else fail "bind your Pulumi token: sbx secret set -g pulumi   (or: printf '%s\\n' \"\$PULUMI_ACCESS_TOKEN\" | sbx secret set -g pulumi)"; fi
else
  fail "sbx not installed: https://docs.docker.com/ai/sandboxes/install/"
fi

say "Pulumi CLI on the host (used for prep, reset and the ESC bootstrap)"
if have pulumi; then
  pv="$(pulumi version 2>/dev/null | sed 's/^v//')"
  if pulumi neo --help >/dev/null 2>&1; then pass "pulumi $pv has 'pulumi neo'"; else fail "pulumi $pv has no 'pulumi neo'; upgrade the CLI (the sandbox image ships 3.260.0)"; fi
  if who="$(pulumi whoami 2>/dev/null)"; then pass "logged in to Pulumi Cloud as $who"; else fail "not logged in: pulumi login"; fi
else
  fail "pulumi CLI not installed: https://www.pulumi.com/docs/install/"
fi

say "Demo project + ESC"
if [ -f "$PROJECT_DIR/Pulumi.yaml" ]; then pass "02-app present ($PROJECT_DIR)"; else fail "02-app missing"; fi
if have pulumi && pulumi whoami >/dev/null 2>&1; then
  org="${PULUMI_ORG:-$(pulumi org get-default 2>/dev/null || true)}"
  if [ -n "$org" ] && pulumi env ls 2>/dev/null | grep -q "^${org}/neo-workshop/aws-oidc"; then
    pass "ESC environment ${org}/neo-workshop/aws-oidc exists"
  else
    fail "ESC environment <org>/neo-workshop/aws-oidc not found; run the bootstrap in 00-esc (see README)"
  fi
  if (cd "$PROJECT_DIR" && pulumi stack ls 2>/dev/null | grep -q "^${STACK}\b"); then pass "stack $STACK exists in 02-app"; else fail "stack $STACK missing in 02-app: cd 02-app && pulumi stack init <org>/$STACK && pulumi up"; fi
fi

say "Optional"
if have asciinema; then pass "asciinema (fallback recording)"; else note "asciinema not installed (brew install asciinema) — only needed for 01-sandbox/record.sh"; fi
if have node; then pass "node $(node --version) (slides)"; else note "node not installed — only needed for the slides"; fi

printf '\n%d ok, %d to fix\n' "$ok" "$bad"
[ "$bad" -eq 0 ]
