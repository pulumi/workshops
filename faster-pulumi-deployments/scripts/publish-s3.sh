#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
language="${1:?Usage: publish-s3.sh typescript|python|go|dotnet|java}"
case "$language" in typescript|python|go|dotnet|java) ;; *) exit 2 ;; esac
: "${RELEASE_URI:?Set RELEASE_URI to a new immutable s3://bucket/prefix/release/language/platform path}"
release="$root/dist/releases/$language"
python3 "$root/scripts/checksum.py" verify "$release/program.tar.gz.sha256"
aws s3 cp "$release/program.tar.gz" "${RELEASE_URI%/}/program.tar.gz"
aws s3 cp "$release/program.tar.gz.sha256" "${RELEASE_URI%/}/program.tar.gz.sha256"
