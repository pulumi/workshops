#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
: "${RELEASE_URI:?Set RELEASE_URI to the selected immutable release directory}"
aws s3 cp "${RELEASE_URI%/}/program.tar.gz" ./program.tar.gz
aws s3 cp "${RELEASE_URI%/}/program.tar.gz.sha256" ./program.tar.gz.sha256
python3 "$root/scripts/checksum.py" verify ./program.tar.gz.sha256
tar -xzf program.tar.gz
bash "$root/scripts/install-plugins.sh" "$PWD/provider-plugins.txt" "$PWD/plugins"
if [ -f ./prepare-python.sh ]; then
    bash ./prepare-python.sh
fi
