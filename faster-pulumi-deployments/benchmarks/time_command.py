"""Measure a build or publication command without recording environment variables."""

import argparse
import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--label", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--log", type=Path, required=True)
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command:
        parser.error("Provide a command after --")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.log.parent.mkdir(parents=True, exist_ok=True)
    started = datetime.now(timezone.utc).isoformat()
    start = time.monotonic()
    with args.log.open("w") as stream:
        result = subprocess.run(command, stdout=stream, stderr=subprocess.STDOUT)
    record = {
        "label": args.label, "started_at": started,
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "elapsed_s": round(time.monotonic() - start, 3),
        "returncode": result.returncode, "command": command,
    }
    records = json.loads(args.output.read_text()) if args.output.exists() else []
    records.append(record)
    args.output.write_text(json.dumps(records, indent=2) + "\n")
    print(json.dumps(record), flush=True)
    raise SystemExit(result.returncode)


if __name__ == "__main__":
    main()
