#!/usr/bin/env bash
# neo-sandbox.sh — entrypoint of the neo-sandbox kit.
#
#   1. Put the guard shims (~/.local/bin) first on PATH so every shell command
#      Neo runs (`sh -c …`) resolves pulumi/aws/terraform/tofu through the guard.
#   2. Find the Pulumi project: `pulumi neo` must start in a directory that has a
#      Pulumi.yaml (explicit NEO_SANDBOX_PROJECT_DIR > current dir > workspace root
#      > first Pulumi.yaml one level below the workspace).
#   3. Print the sandbox boundaries (identity via the proxy, no cloud creds in the
#      VM, egress allow-list, guard status, modes).
#   4. exec `pulumi neo --approval-mode … --permission-mode … [extra args]`.
#
# Modes come from NEO_SANDBOX_APPROVAL_MODE / NEO_SANDBOX_PERMISSION_MODE (set by
# the kit args at create time, or per session with `sbx run --env …`). Set
# NEO_SANDBOX_QUIET=1 to skip the banner. Self-contained: bash + the Pulumi CLI.
set -uo pipefail

export PATH="$HOME/.local/bin:$PATH"
approval="${NEO_SANDBOX_APPROVAL_MODE:-manual}"
permission="${NEO_SANDBOX_PERMISSION_MODE:-default}"
quiet="${NEO_SANDBOX_QUIET:-0}"
ws_file="$HOME/.config/neo-sandbox/workspace"
guard_log="$HOME/.local/state/neo-sandbox/guard.log"
allow_file="$HOME/.config/neo-sandbox/allow-destructive"

say() { [ "$quiet" = "1" ] || printf '%s\n' "$*" >&2; }

# --- 1. modes ---------------------------------------------------------------
case "$approval" in manual|balanced|auto) ;; *)
  say "neo-sandbox: NEO_SANDBOX_APPROVAL_MODE='$approval' is not one of manual|balanced|auto; using manual"
  approval=manual ;;
esac
case "$permission" in default|read-only) ;; *)
  say "neo-sandbox: NEO_SANDBOX_PERMISSION_MODE='$permission' is not one of default|read-only; using default"
  permission=default ;;
esac

# --- 2. project directory ---------------------------------------------------
workspace=""
[ -f "$ws_file" ] && workspace="$(head -n1 "$ws_file" 2>/dev/null || true)"
project=""
if [ -n "${NEO_SANDBOX_PROJECT_DIR:-}" ] && [ -f "${NEO_SANDBOX_PROJECT_DIR}/Pulumi.yaml" ]; then
  project="$NEO_SANDBOX_PROJECT_DIR"
elif [ -f "./Pulumi.yaml" ]; then
  project="$PWD"
elif [ -n "$workspace" ] && [ -f "$workspace/Pulumi.yaml" ]; then
  project="$workspace"
elif [ -n "$workspace" ] && [ -d "$workspace" ]; then
  first="$(find "$workspace" -mindepth 2 -maxdepth 2 -name Pulumi.yaml -not -path '*/node_modules/*' 2>/dev/null | sort | head -n1 || true)"
  [ -n "$first" ] && project="$(dirname "$first")"
fi
if [ -n "$project" ]; then
  cd "$project" || exit 1
else
  say "neo-sandbox: no Pulumi.yaml found (cwd=$PWD, workspace=${workspace:-?}); starting Neo here anyway"
fi

# --- 3. banner --------------------------------------------------------------
if [ "$quiet" != "1" ]; then
  pv="$(pulumi version 2>/dev/null || echo '?')"
  who="$(timeout 20 pulumi whoami -v 2>/dev/null || true)"
  user="$(printf '%s\n' "$who" | awk -F': ' '/^User:/{print $2}')"
  orgs="$(printf '%s\n' "$who" | awk -F': ' '/^Organizations:/{print $2}')"
  token="${PULUMI_ACCESS_TOKEN:-<unset>}"
  case "$token" in proxy-managed|*sbx*|*managed*) token_note="placeholder only; the real token stays on the host" ;;
    '<unset>') token_note="NOT SET: bind it on the host with 'sbx secret set -g pulumi'" ;;
    *) token_note="a literal token is present in the VM (not proxy-managed)" ;; esac
  creds="none"
  { [ -n "${AWS_ACCESS_KEY_ID:-}" ] || [ -f "$HOME/.aws/credentials" ]; } && creds="AWS credentials present in the VM"
  { [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] || [ -n "${AZURE_CLIENT_SECRET:-}" ]; } && creds="$creds (+ other cloud creds)"
  guard="on: destructive pulumi/aws/terraform/tofu commands are blocked"
  [ -f "$allow_file" ] && guard="OFF for this sandbox ($allow_file exists)"
  say ""
  say "┌─ Neo in a Docker Sandbox ─────────────────────────────────────────────"
  say "│ agent       pulumi neo  (Pulumi CLI $pv)"
  if [ -n "$user" ]; then
    say "│ identity    $user  orgs: ${orgs:-?}   — via 'pulumi login' through the credential proxy"
  else
    say "│ identity    could not reach api.pulumi.com as you (is the pulumi secret bound? is api.pulumi.com allowed?)"
  fi
  say "│ token       PULUMI_ACCESS_TOKEN=$token  ($token_note)"
  say "│ cloud creds $creds; stacks get short-lived AWS creds from Pulumi ESC at run time"
  say "│ egress      default-deny; only the kit's allow-list is reachable (sbx policy log <sandbox> on the host)"
  say "│ guard       $guard"
  say "│ modes       approval=$approval  permission=$permission   (NEO_SANDBOX_* or sbx run --env …)"
  say "│ project     ${project:-<none>}"
  say "└───────────────────────────────────────────────────────────────────────"
  [ -f "$guard_log" ] && say "  guard log: $guard_log ($(wc -l < "$guard_log") blocked command(s) so far)"
  say ""
fi

# --- 4. run Neo -------------------------------------------------------------
exec pulumi neo --approval-mode "$approval" --permission-mode "$permission" "$@"
