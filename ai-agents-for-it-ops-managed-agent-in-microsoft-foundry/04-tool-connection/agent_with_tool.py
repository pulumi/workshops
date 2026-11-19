#!/usr/bin/env python3
"""Re-create the IT-ops Foundry agent with a file-search tool attached.

Same lifecycle pattern as `../03-agent/agent.py`, duplicated rather than
imported across the folder boundary (each numbered folder stays
independently runnable -- see AGENTS.md). Adds a `tools=[...]` entry to the
`PromptAgentDefinition`, referencing the `ProjectConnection` this folder's
`__main__.py` wires to the runbooks blob container.

Method and class names (`create_version`, `delete_version`,
`FileSearchToolDefinition`) are best-current-knowledge from the Microsoft
Learn quickstart cited in the build brief, not verified against the
installed `azure-ai-projects` package this run -- see AGENTS.md.
"""

import argparse
import sys

from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import FileSearchToolDefinition, PromptAgentDefinition
from azure.identity import DefaultAzureCredential

SYSTEM_PROMPT = (
    "You are an IT operations assistant. Answer questions about the "
    "organization's runbooks and infrastructure procedures. When the answer "
    "depends on a specific runbook, cite the runbook file name you drew it "
    "from. If nothing in the connected knowledge source answers the "
    "question, say so plainly rather than guessing."
)


def create(endpoint: str, agent_name: str, deployment: str, connection_name: str) -> None:
    client = AIProjectClient(endpoint=endpoint, credential=DefaultAzureCredential())
    agent = client.agents.create_version(
        agent_name=agent_name,
        definition=PromptAgentDefinition(
            model=deployment,
            instructions=SYSTEM_PROMPT,
            tools=[FileSearchToolDefinition(connection_names=[connection_name])],
        ),
    )
    # local.Command captures stdout as its `stdout` output.
    print(agent.id)


def delete(endpoint: str, agent_name: str) -> None:
    client = AIProjectClient(endpoint=endpoint, credential=DefaultAzureCredential())
    # Targets version "2": the second `create_version` call against this
    # agent name (version "1" comes from 03-agent/agent.py). Assumes
    # teardown runs 04 before 03, per 06-teardown -- see AGENTS.md.
    client.agents.delete_version(agent_name=agent_name, agent_version="2")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="action", required=True)

    create_parser = subparsers.add_parser("create")
    create_parser.add_argument("--endpoint", required=True)
    create_parser.add_argument("--agent-name", required=True)
    create_parser.add_argument("--deployment", required=True)
    create_parser.add_argument("--connection-name", required=True)

    delete_parser = subparsers.add_parser("delete")
    delete_parser.add_argument("--endpoint", required=True)
    delete_parser.add_argument("--agent-name", required=True)

    args = parser.parse_args()

    try:
        if args.action == "create":
            create(args.endpoint, args.agent_name, args.deployment, args.connection_name)
        elif args.action == "delete":
            delete(args.endpoint, args.agent_name)
    except Exception as exc:  # noqa: BLE001 -- surface any SDK/auth failure to the CLI caller
        print(f"agent_with_tool.py {args.action} failed: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
