"""Step 8: the reaper. Destroys and removes every sandbox stack whose expires-at tag has passed.

    python reaper.py            # reap
    python reaper.py --dry-run  # list what would be reaped

Run it from cron, a CI schedule or a loop. Pulumi Cloud TTL stacks (Pro and Enterprise
editions) do the same job as a managed feature; this version runs on any edition.
"""
import argparse
from datetime import datetime, timezone

from pulumi import automation as auto

PROJECT = "agent-sandboxes"


def parse(ts: str) -> datetime:
    return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def main(dry_run: bool) -> None:
    ws = auto.LocalWorkspace(project_settings=auto.ProjectSettings(name=PROJECT, runtime="python"))
    now = datetime.now(timezone.utc)
    for summary in ws.list_stacks():
        if not summary.name.startswith("sandbox-"):
            continue
        stack = auto.select_stack(summary.name, project_name=PROJECT, program=lambda: None)
        expires = stack.list_tags().get("expires-at")
        if not expires:
            print(f"{summary.name}: no expires-at tag, skipped")
            continue
        if parse(expires) > now:
            print(f"{summary.name}: expires {expires}, keeping")
            continue
        print(f"{summary.name}: expired {expires}, {'would destroy' if dry_run else 'destroying'}")
        if not dry_run:
            stack.destroy(on_output=lambda line: print(f"[{summary.name}] {line}", end=""))
            ws.remove_stack(summary.name)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    main(ap.parse_args().dry_run)
