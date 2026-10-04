#!/usr/bin/env bash
# grow-gpus.sh — advertise more fake GPUs per worker, so a waiting gang job can start.
#   03-jobs/grow-gpus.sh 5
set -uo pipefail
# shellcheck source=../lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
have pulumi || die "pulumi not installed"
n="${1:-}"
case "$n" in
  '' | *[!0-9]*) die "usage: grow-gpus.sh <gpus per worker>" ;;
esac
cd "$WORKSHOP_DIR/01-cluster" || die "cannot enter 01-cluster"
pulumi config set gpusPerWorker "$n" --stack "$STACK" || die "config set failed"
pulumi up --yes --stack "$STACK" || die "pulumi up failed"
