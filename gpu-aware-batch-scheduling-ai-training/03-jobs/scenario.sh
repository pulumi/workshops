#!/usr/bin/env bash
# scenario.sh — switch the training scenario and apply it with `pulumi up`.
#   03-jobs/scenario.sh default-scheduler | gang | fair-share | none
set -uo pipefail
# shellcheck source=../lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
have pulumi || die "pulumi not installed"
scenario="${1:-}"
case "$scenario" in
  none | default-scheduler | gang | fair-share) ;;
  *) die "usage: scenario.sh none|default-scheduler|gang|fair-share" ;;
esac
cd "$WORKSHOP_DIR/03-jobs" || die "cannot enter 03-jobs"
pulumi config set scenario "$scenario" --stack "$STACK" || die "config set failed"
pulumi up --yes --stack "$STACK" || die "pulumi up failed"
