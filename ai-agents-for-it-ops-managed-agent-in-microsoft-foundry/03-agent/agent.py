#!/usr/bin/env python3
"""Create or delete the IT-ops Foundry prompt agent.

Standalone script invoked by `__main__.py`'s pulumi_command.local.Command,
since Foundry agents are data-plane-only (no azure-native resource type --
see AGENTS.md). Uses the azure-ai-projects SDK against the project's
data-plane endpoint.

Method and class names (`create_version`, `delete_version`,
`PromptAgentDefinition`) are best-current-knowledge from the Microsoft Learn
"Create a prompt agent" quickstart cited in the build brief, read
2026-09-29, not verified against the installed package this run -- see
AGENTS.md.
"""

import argparse
import sys

from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition
from azure.identity import DefaultAzureCredential

SYSTEM_PROMPT = (
    "You are an IT operations assistant. Answer questions about the "
    "organization's runbooks and infrastructure procedures. When the answer "
    "depends on a specific runbook, cite the runbook file name you drew it "
    "from. If nothing in the connected knowledge source answers the "
    "question, say so plainly rather than guessing."
)


def create(endpoint: str, agent_name: str, deployment: str) -> None:
    client = AIProjectClient(endpoint=endpoint, credential=DefaultAzureCredential())
    agent = client.agents.create_version(
        agent_name=agent_name,
        definition=PromptAgentDefinition(
            model=deployment,
            instructions=SYSTEM_PROMPT,
        ),
    )
    # local.Command captures stdout as its `stdout` output -- __main__.py
    # reads this into the `agent_id` stack export.
    print(agent.id)


def delete(endpoint: str, agent_name: str) -> None:
    client = AIProjectClient(endpoint=endpoint, credential=DefaultAzureCredential())
    # Targets version "1", the only version this script's `create` ever
    # produces. 04-tool-connection/agent_with_tool.py deletes version "2"
    # before this runs, if teardown follows the documented folder order
    # (04 before 03) -- see AGENTS.md.
    client.agents.delete_version(agent_name=agent_name, agent_version="1")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="action", required=True)

    create_parser = subparsers.add_parser("create")
    create_parser.add_argument("--endpoint", required=True)
    create_parser.add_argument("--agent-name", required=True)
    create_parser.add_argument("--deployment", required=True)

    delete_parser = subparsers.add_parser("delete")
    delete_parser.add_argument("--endpoint", required=True)
    delete_parser.add_argument("--agent-name", required=True)

    args = parser.parse_args()

    try:
        if args.action == "create":
            create(args.endpoint, args.agent_name, args.deployment)
        elif args.action == "delete":
            delete(args.endpoint, args.agent_name)
    except Exception as exc:  # noqa: BLE001 -- surface any SDK/auth failure to the CLI caller
        print(f"agent.py {args.action} failed: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
