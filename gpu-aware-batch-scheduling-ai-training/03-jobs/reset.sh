#!/usr/bin/env bash
# reset.sh — back to the start of step 3: no jobs, four fake GPUs per worker.
#   03-jobs/reset.sh
set -uo pipefail
HERE="$(dirname "${BASH_SOURCE[0]}")"
"$HERE/scenario.sh" none || exit 1
"$HERE/grow-gpus.sh" 4
