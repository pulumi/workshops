#!/usr/bin/env bash
# set-external-address.sh — alias for `deploy.sh address` (phase two of the backend install).
#
#   02-provider/set-external-address.sh
# shellcheck source=../01-stacks-and-esc/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../01-stacks-and-esc/lib.sh"
exec "$(dirname "${BASH_SOURCE[0]}")/deploy.sh" address
