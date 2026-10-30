#!/usr/bin/env bash
set -euo pipefail
directory="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
python="${PYTHON:-python3}"
"$python" -c 'import sys; assert sys.version_info[:2] == (3, 12), "Use Python 3.12 for this artifact"'
"$python" -m venv "$directory/.venv"
"$directory/.venv/bin/python" -m pip install --no-index --require-hashes \
    --find-links "$directory/wheels" --requirement "$directory/requirements.txt"
