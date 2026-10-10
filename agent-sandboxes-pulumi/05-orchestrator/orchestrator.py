"""Step 5: spawn one Pulumi stack per agent task with the Automation API.

    python orchestrator.py spawn task-a task-b task-c --ttl-minutes 30
    python orchestrator.py spawn bad-task --noncompliant --policy-pack ../07-policy
    python orchestrator.py list

The Pulumi CLI is the engine underneath; this program never shells out to it.
"""
import argparse
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pulumi import automation as auto

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "04-sandbox"))
from sandbox import sandbox_program  # noqa: E402

PROJECT = "agent-sandboxes"
ESC_REF = "agent-sandboxes/aws"
REGION = "eu-west-1"
STATE_DIR = HERE.parent / ".state"


def boundary_arn() -> str:
    return os.environ.get("BOUNDARY_ARN") or (STATE_DIR / "boundary-arn").read_text().strip()


def stack_name(task_id: str) -> str:
    return f"sandbox-{task_id}"


def spawn(task_id: str, ttl_minutes: int, owner: str, compliant: bool = True,
          policy_packs: list[str] | None = None) -> dict:
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)).strftime("%Y-%m-%dT%H:%M:%SZ")
    stack = auto.create_or_select_stack(
        stack_name=stack_name(task_id),
        project_name=PROJECT,
        program=sandbox_program(task_id, boundary_arn(), owner, expires_at, compliant),
        opts=auto.LocalWorkspaceOptions(
            project_settings=auto.ProjectSettings(name=PROJECT, runtime="python"),
        ),
    )
    stack.set_config("aws:region", auto.ConfigValue(REGION))
    # Credentials: the stack opens the Pulumi ESC environment. No key is stored here.
    stack.workspace.add_environments(stack.name, ESC_REF)
    stack.set_tag("expires-at", expires_at)
    stack.set_tag("owner", owner)
    result = stack.up(on_output=lambda line: print(f"[{task_id}] {line}", end=""), policy_packs=policy_packs)
    return {"task": task_id, "expires_at": expires_at,
            "bucket": result.outputs["bucket"].value, "role_arn": result.outputs["roleArn"].value}


def spawn_many(tasks: list[str], ttl_minutes: int, owner: str) -> list[dict]:
    with ThreadPoolExecutor(max_workers=3) as pool:  # three tasks only: stays inside API limits
        return list(pool.map(lambda t: spawn(t, ttl_minutes, owner), tasks))


def list_sandboxes() -> list[dict]:
    ws = auto.LocalWorkspace(project_settings=auto.ProjectSettings(name=PROJECT, runtime="python"))
    rows = []
    for summary in ws.list_stacks():
        if not summary.name.startswith("sandbox-"):
            continue
        stack = auto.select_stack(summary.name, project_name=PROJECT, program=lambda: None)
        rows.append({"stack": summary.name, "expires-at": stack.list_tags().get("expires-at", "-")})
    return rows


def main() -> None:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("spawn")
    s.add_argument("tasks", nargs="+")
    s.add_argument("--ttl-minutes", type=int, default=30)
    s.add_argument("--owner", default=os.environ.get("USER", "demo"))
    s.add_argument("--noncompliant", action="store_true", help="build the bad sandbox of step 7")
    s.add_argument("--policy-pack", action="append", help="path to a policy pack")
    sub.add_parser("list")
    a = p.parse_args()

    if a.cmd == "spawn":
        if a.noncompliant or a.policy_pack:
            out = [spawn(t, a.ttl_minutes, a.owner, compliant=not a.noncompliant, policy_packs=a.policy_pack)
                   for t in a.tasks]
        else:
            out = spawn_many(a.tasks, a.ttl_minutes, a.owner)
        for row in out:
            print(row)
    else:
        for row in list_sandboxes():
            print(row)


if __name__ == "__main__":
    main()
