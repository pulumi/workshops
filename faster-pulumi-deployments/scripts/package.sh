#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
language="${1:?Usage: package.sh typescript|python|go|dotnet|java}"
case "$language" in typescript|python|go|dotnet|java) ;; *) exit 2 ;; esac
output="$root/dist/$language"
test -f "$output/Pulumi.yaml"
bash "$root/scripts/fetch-plugins.sh" "$output/plugins"
release="$root/dist/releases/$language"
mkdir -p "$release"
tar --exclude=./.venv --exclude='./Pulumi.*.yaml' --exclude=./.pulumi \
    -czf "$release/program.tar.gz" -C "$output" .
python3 "$root/scripts/checksum.py" write "$release/program.tar.gz"
python3 "$root/scripts/checksum.py" verify "$release/program.tar.gz.sha256"
printf 'Release files: %s\n' "$release"
