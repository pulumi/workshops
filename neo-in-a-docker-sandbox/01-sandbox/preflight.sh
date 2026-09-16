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
  if [ -n "$v" ] && vergte "$v" "0.42.0"; then pass "sbx $v (>= 0.42.0: kit refs as the agent positional)"; else fail "sbx >= 0.42.0 required, found '${v:-none}'  (brew install docker/tap/sbx)"; fi
  if sbx version 2>/dev/null | grep -qi 'server'; then pass "sbx daemon reachable"; else note "could not read the server version from 'sbx version' (check 'sbx daemon status')"; fi
  if sbx policy ls >/dev/null 2>&1; then pass "global network policy initialized (sbx policy ls)"; else fail "run 'sbx policy init balanced' once (the kit's allow-list applies on top)"; fi
  if sbx kit validate "$REGION_KIT" >/dev/null 2>&1; then pass "region mixin is a valid kit ($REGION_KIT)"; else fail "sbx kit validate $REGION_KIT fails; fix the spec"; fi
  if grep -q "s3.${AWS_REGION}.amazonaws.com" "$REGION_KIT/spec.yaml" 2>/dev/null; then
    pass "region mixin allows $AWS_REGION (applied when the sandbox is created)"
  else
    fail "edit $REGION_KIT/spec.yaml so it lists the region your ESC environment hands out"
  fi
  cfg_region="$(sed -n 's/^[[:space:]]*aws:region:[[:space:]]*//p' "$PROJECT_DIR/Pulumi.dev.yaml" 2>/dev/null | tr -d '"' | head -n1)"
  if [ "$cfg_region" = "$AWS_REGION" ]; then
    pass "02-app pins aws:region=$cfg_region, the region the mixin allows"
  else
    fail "02-app pins aws:region='${cfg_region:-unset}' but the mixin allows '$AWS_REGION'"
    note "unpinned, the region comes from the ESC environment's AWS_REGION, and a"
    note "blocked endpoint surfaces as 'unable to validate AWS credentials' (STS 403)"
    note "fix either side: cd 02-app && pulumi config set aws:region $AWS_REGION"
  fi
  if sbx policy ls 2>/dev/null | grep -qE '(^|[[:space:]"])\*\*([[:space:]"]|$)'; then
    fail "an allow rule for '**' lets every sandbox reach every host, so demo step 2 cannot show a block"
    note "that is the Open preset (docs: equivalent to 'sbx policy allow network \"**\"')"
    note "it is machine-wide: a fresh neo-demo will not change it"
    note "see where it comes from:  sbx policy ls --source local --type network --wide"
    note "added on top of the baseline? remove just that rule:  sbx policy rm network --resource '**'"
    note "switch the machine to Balanced (default deny plus a dev allowlist):  sbx policy reset   then pick Balanced; it applies to every sandbox here"
    note "it cannot be narrowed per sandbox: allows are additive, and denying '**' for one sandbox would block everything in it"
  else
    pass "no allow-all (**) rule in the policy"
  fi
  note "unlisted host, demo sandbox: $(sbx policy check network --sandbox "$SANDBOX" ifconfig.me 2>&1 | head -n1)"
  if sbx secret ls 2>/dev/null | grep -qi 'pulumi'; then pass "pulumi secret stored (sbx secret ls)"; else fail "store your Pulumi token once: sbx secret set pulumi   (global by default; set it before creating the sandbox)"; fi
  note "kits from GHCR need a one-time: sbx settings set kit.allowedSources '[\"docker.io/\",\"ghcr.io/dirien/\"]'"
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
if git -C "$WORKSHOP_DIR" ls-files --error-unmatch 02-app/index.ts >/dev/null 2>&1; then pass "02-app/index.ts is tracked by git (reset.sh restores it)"; else fail "02-app/index.ts is not in a git repository; reset.sh and step 6 need one (git init && git add -A && git commit -m baseline)"; fi
if have pulumi && pulumi whoami >/dev/null 2>&1; then
  org="${PULUMI_ORG:-$(pulumi org get-default 2>/dev/null || true)}"
  env_ref="$(esc_env)"
  if [ -z "$env_ref" ]; then
    fail "02-app imports no ESC environment: cd 02-app && pulumi config env add <your-project>/<your-env> --stack $STACK --yes"
  elif pulumi env ls 2>/dev/null | grep -q "$env_ref"; then
    pass "02-app imports the ESC environment $env_ref"
  else
    fail "02-app imports '$env_ref' but you cannot see it in 'pulumi env ls'; check the name and your access"
  fi
  if (cd "$PROJECT_DIR" && pulumi stack ls 2>/dev/null | grep -q "^${STACK}\b"); then pass "stack $STACK exists in 02-app"; else fail "stack $STACK missing in 02-app: cd 02-app && pulumi stack init <org>/$STACK && pulumi up"; fi
  if [ -n "$org" ] && pulumi policy ls "$org" 2>/dev/null | grep -q "neo-workshop-guardrails"; then note "policy pack neo-workshop-guardrails is published (optional: no demo step runs it)"; else note "policy pack not published; optional since the policy beat left the demo (cd 04-policy && pulumi policy publish <org>)"; fi
fi

say "Optional"
if have asciinema; then pass "asciinema (fallback recording)"; else note "asciinema not installed (brew install asciinema) — only needed for 01-sandbox/record.sh"; fi
if have node; then pass "node $(node --version) (slides)"; else note "node not installed — only needed for the slides"; fi

printf '\n%d ok, %d to fix\n' "$ok" "$bad"
[ "$bad" -eq 0 ]
