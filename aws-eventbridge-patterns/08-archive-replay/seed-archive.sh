#!/usr/bin/env bash
set -euo pipefail
# Puts five order.created events on the bus so the archive has something to replay.
# Run this at least ten minutes before replay.sh. The archive only receives events once it exists.
# Run from a step folder, inside `pulumi env run <org>/aws-eventbridge-patterns/dev --`.
# STACK=seed ./seed-archive.sh targets the separate pre-seeded stack (see the README).
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$HERE/../02-bus-and-rule/send-event.sh" order.created 5
date -u +"seeded at %Y-%m-%dT%H:%M:%SZ"
