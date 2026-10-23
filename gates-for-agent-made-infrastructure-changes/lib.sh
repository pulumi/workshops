#!/usr/bin/env bash
# lib.sh: shared bits for the demo scripts (sourced, not run).
# shellcheck disable=SC2034 # the variables are used by the scripts that source this file
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORG="${PULUMI_ORG:-}"                       # your Pulumi Cloud org
ESC_PROJECT=agent-gates
ESC_ENV=aws-prod
STACK=agent-gates
AWS_REGION_DEMO=eu-west-1

die() { echo "error: $*" >&2; exit 1; }
info() { echo "==> $*"; }

require_cmd() {
  local c
  for c in "$@"; do
    command -v "$c" >/dev/null 2>&1 || die "missing command: $c"
  done
}

require_org() {
  [[ -n "$ORG" ]] || die "set PULUMI_ORG to your Pulumi Cloud org name"
}

# <org>/agent-gates/aws-prod
esc_fqn() {
  require_org
  echo "$ORG/$ESC_PROJECT/$ESC_ENV"
}

# confirm <prompt>: interactive y/N; ASSUME_YES=1 skips the question.
confirm() {
  [[ "${ASSUME_YES:-0}" == "1" ]] && return 0
  local answer
  read -r -p "$1 [y/N] " answer
  [[ "$answer" == "y" || "$answer" == "Y" ]]
}

# folder_dir <NN-name>: absolute path of a step folder.
folder_dir() {
  echo "$REPO_ROOT/$1"
}
