#!/usr/bin/env bash
# record.sh — record the happy path with asciinema as the on-stage fallback.
#
#   01-sandbox/record.sh                 # records 01-sandbox/up.sh into 01-sandbox/recordings/<timestamp>.cast
#   asciinema play 01-sandbox/recordings/<file>.cast     # play it back (space = pause, . = step)
#
# Do the whole demo flow inside the recording: the shell, pulumi neo,
# approvals, read-only, the protected delete. Exit the shell to stop. Convert to a
# GIF/MP4 for the slides with `agg <file>.cast neo-demo.gif` if you want an
# embedded version. Recordings are gitignored (they can contain bucket names).
set -euo pipefail
# shellcheck source=lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
have asciinema || die "asciinema not installed (brew install asciinema)"
mkdir -p "$WORKSHOP_DIR/01-sandbox/recordings"
out="$WORKSHOP_DIR/01-sandbox/recordings/neo-demo-$(date +%Y%m%d-%H%M%S).cast"
say "recording to $out"
note "the recording starts the sandbox via 01-sandbox/up.sh; exit the sandbox shell to stop"
asciinema rec --overwrite --idle-time-limit 3 --title "Neo in a Docker Sandbox" \
  --command "$WORKSHOP_DIR/01-sandbox/up.sh $*" "$out"
say "saved $out"
note "play:  asciinema play $out"
