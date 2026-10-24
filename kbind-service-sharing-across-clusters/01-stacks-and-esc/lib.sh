#!/usr/bin/env bash
# lib.sh — shared bits for the demo scripts (sourced, not run).
# Everything here runs on your laptop. No static AWS keys: AWS credentials
# come from the Pulumi ESC environments in 01-stacks-and-esc/envs.
# shellcheck disable=SC2034 # the variables are used by the scripts that source this file
WORKSHOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="$WORKSHOP_DIR/.state"                  # kubeconfigs and the kubectl-bind binary; gitignored
PROVIDER_DIR="$WORKSHOP_DIR/02-provider"
CONSUMER_DIR="$WORKSHOP_DIR/05-consumer"
ENVS_DIR="$WORKSHOP_DIR/01-stacks-and-esc/envs"

# The organization comes from KBIND_DEMO_ORG, else `pulumi org set-default`.
ORG="${KBIND_DEMO_ORG:-$(pulumi org get-default 2>/dev/null || true)}"
AWS_REGION="eu-central-1"
ESC_PROJECT="kbind-workshop"                      # ESC project; environments are <org>/kbind-workshop/<stack>
PROVIDER_STACK="provider-dev"
CONSUMER_A_STACK="consumer-a-dev"
CONSUMER_B_STACK="consumer-b-dev"

# Pins. All of them come from the workshop brief; see README "Open points".
KBIND_VERSION="0.8.1"                             # chart, kubectl-bind plugin and image tags
KBIND_CHART="oci://ghcr.io/kbind-dev/charts/backend"
KBIND_IMAGE_REPO="ghcr.io/kbind-dev/backend"      # the chart default (ghcr.io/kube-bind/backend) is not pullable
KONNECTOR_IMAGE="ghcr.io/kbind-dev/konnector:v${KBIND_VERSION}"
KBIND_RELEASE_URL="https://github.com/kbind-dev/kbind/releases/download/v${KBIND_VERSION}"

# Set KBIND_DEMO_YES=1 to skip the confirmation prompt of pulumi up/destroy and
# pulumi env rm (rehearsals). Left empty, every mutating command asks first.
YES_FLAG=()
[ "${KBIND_DEMO_YES:-}" = "1" ] && YES_FLAG=(--yes)

# The kubectl-bind plugin installed by 06-bind/install-plugin.sh.
export PATH="$STATE_DIR/bin:$PATH"

say()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
note() { printf '  \033[2m%s\033[0m\n' "$*"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

need_org() { [ -n "$ORG" ] || die "no Pulumi organization. Run: pulumi org set-default <org>  (or export KBIND_DEMO_ORG=<org>)"; }

# stack_dir <stack> — the project directory a stack belongs to.
stack_dir() {
  case "$1" in
    "$PROVIDER_STACK") echo "$PROVIDER_DIR" ;;
    consumer-*) echo "$CONSUMER_DIR" ;;
    *) die "unknown stack $1" ;;
  esac
}

# esc_env <stack> — fully qualified ESC environment for a stack.
esc_env() { echo "$ORG/$ESC_PROJECT/$1"; }

# run <cmd...> — print the command, then run it. Every command a slide shows goes through here.
run() { printf '  \033[1m$ %s\033[0m\n' "$*"; "$@"; }

# write_kubeconfig <stack> — saves the stack's secret kubeconfig output to .state/kubeconfigs/<stack>.json
write_kubeconfig() {
  local stack="$1" out="$STATE_DIR/kubeconfigs/$1.json"
  mkdir -p "$STATE_DIR/kubeconfigs"
  pulumi stack output kubeconfig --show-secrets --stack "$ORG/$stack" --cwd "$(stack_dir "$stack")" >"$out" \
    || die "no kubeconfig output for $stack. Deploy the cluster first."
  chmod 600 "$out"
  echo "$out"
}

# kc <stack> <command...> — run a command with KUBECONFIG pointing at the stack's cluster.
# The EKS kubeconfig calls `aws eks get-token`, which needs AWS credentials, so the
# command runs inside `pulumi env run` for the stack's ESC environment.
kc() {
  local stack="$1"; shift
  local cfg="$STATE_DIR/kubeconfigs/$stack.json"
  [ -f "$cfg" ] || cfg="$(write_kubeconfig "$stack")"
  printf '  \033[1m$ [%s] %s\033[0m\n' "$stack" "$*"
  KUBECONFIG="$cfg" pulumi env run "$(esc_env "$stack")" -- "$@"
}

# vergte <a> <b> — true when version a >= b (dotted numbers only)
vergte() {
  local lo
  lo="$(printf '%s\n%s\n' "$1" "$2" | sort -t. -k1,1n -k2,2n -k3,3n | head -n1)"
  [ "$lo" = "$2" ]
}
