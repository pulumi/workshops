#!/usr/bin/env python3
"""Map exported Pulumi Cloud audit log events to the workshop steps.

Usage:
    python3 timeline.py audit.json
    python3 timeline.py audit.csv --user agent-user

Reads either export format described in the audit log formats reference:
JSON ({"auditLogEvents": [...]} or a bare list of events) or CSV with the
columns Timestamp, Name, Login, Event, Description, SourceIP, ... .
Prints one line per event of interest, oldest first, with the step it belongs
to. Standard library only.
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import datetime, timezone

# Event names are from the audit log events reference. The reference lists no
# event for creating, approving or applying an open request; those show up only
# indirectly (environment-open after the grant is active,
# environment-unauthorized-open or a failed run when it is not).
STEP_EVENTS = {
    "stack-update-started": "3-7 agent runs pulumi up",
    "stack-update-completed": "3-7 update finished",
    "stack-update-canceled": "3-7 update canceled",
    "environment-open": "4-5 credential environment opened",
    "environment-import-open": "4-5 environment opened as an import",
    "environment-unauthorized-open": "4 open denied",
    "agent-task-created": "6 Neo task created",
    "agent-task-updated": "6 Neo task updated (for example permission mode)",
    "policy-pack-created": "2 policy pack published",
    "policy-pack-enabled": "2 policy pack enabled for a policy group",
    "policy-group-updated": "2 policy group changed",
}


def load(path: str) -> list[dict]:
    """Return normalized events: timestamp (int), event, login, description."""
    with open(path, newline="", encoding="utf-8") as handle:
        text = handle.read()
    stripped = text.lstrip()
    events: list[dict] = []
    if stripped.startswith(("{", "[")):
        data = json.loads(text)
        items = data.get("auditLogEvents", []) if isinstance(data, dict) else data
        for item in items:
            user = item.get("user") or {}
            events.append(
                {
                    "timestamp": int(item["timestamp"]),
                    "event": item.get("event", ""),
                    "login": user.get("githubLogin") or user.get("name") or "",
                    "description": item.get("description", ""),
                }
            )
    else:
        reader = csv.DictReader(text.splitlines(), skipinitialspace=True)
        for row in reader:
            events.append(
                {
                    "timestamp": int(row["Timestamp"]),
                    "event": row.get("Event", ""),
                    "login": row.get("Login") or row.get("Name") or "",
                    "description": row.get("Description", ""),
                }
            )
    return events


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("path", help="audit log export (JSON or CSV)")
    parser.add_argument("--user", help="only show events by this login")
    args = parser.parse_args()

    events = load(args.path)
    if args.user:
        events = [e for e in events if e["login"] == args.user]
    events.sort(key=lambda e: e["timestamp"])

    shown = 0
    for e in events:
        step = STEP_EVENTS.get(e["event"])
        if step is None:
            continue
        when = datetime.fromtimestamp(e["timestamp"], tz=timezone.utc).strftime("%H:%M:%SZ")
        print(f"{when}  step {step:<48} {e['event']:<32} {e['login']}")
        shown += 1

    missing = sorted(set(STEP_EVENTS) - {e["event"] for e in events})
    print(f"\n{shown} events mapped from {len(events)} read.", file=sys.stderr)
    if missing:
        print("not seen in this export: " + ", ".join(missing), file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
