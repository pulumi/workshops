#!/usr/bin/env bash
# check-readme.sh: every path in the README layout tree exists on disk, nothing
# on disk is missing from the tree, and every script the README runs exists.
#
#   scripts/check-readme.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

python3 - <<'PY'
import os, re, subprocess, sys

lines = open("README.md").read().split("## Layout")[1].split("```text")[1].split("```")[0].splitlines()[1:]
stack, listed = [], set()
for line in lines:
    m = re.match(r"^((?:│   |    )*)(?:├── |└── )(.+)$", line)
    if not m:
        continue
    depth = len(m.group(1)) // 4
    name = m.group(2)
    stack = stack[:depth]
    path = "/".join(stack + [name.rstrip("/")])
    if name.endswith("/"):
        stack.append(name.rstrip("/"))
    else:
        listed.add(path)

tracked = subprocess.run(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard", "."],
    capture_output=True, text=True, check=True).stdout.split()
ondisk = {p for p in tracked}
bad = 0
for p in sorted(listed):
    if not os.path.isfile(p):
        print("listed but missing:", p); bad += 1
for p in sorted(ondisk - listed):
    print("on disk but not listed:", p); bad += 1

readme = open("README.md").read()
for script in sorted(set(re.findall(r"(?<![\w/.-])((?:\d\d-[a-z-]+/)?(?:scripts/)?[a-z-]+\.sh)\b", readme))):
    candidates = [p for p in listed if p.endswith(script)]
    if not candidates:
        print("README runs a script that does not exist:", script); bad += 1
print("layout entries:", len(listed), "problems:", bad)
sys.exit(1 if bad else 0)
PY
