import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
language = sys.argv[1]
if language not in ("typescript", "python", "go", "dotnet", "java"):
    raise SystemExit("Unknown language")
program = root / "dist" / language
if not (program / "Pulumi.yaml").is_file():
    raise SystemExit("Build the program first")
workspace = root / "workspaces" / language
workspace.mkdir(parents=True, exist_ok=True)
template = (root / "programs" / language / "Pulumi.image.yaml").read_text()
lines = []
for line in template.splitlines():
    if "/opt/pulumi-program" in line:
        key, value = line.split(":", 1)
        line = key + ": " + json.dumps(value.strip().replace("/opt/pulumi-program", str(program)))
    lines.append(line)
(workspace / "Pulumi.yaml").write_text("\n".join(lines) + "\n")
print("External stack configuration workspace:", workspace)
