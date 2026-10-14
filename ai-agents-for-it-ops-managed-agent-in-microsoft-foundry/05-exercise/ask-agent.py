#!/usr/bin/env python3
"""Ask the IT-ops Foundry agent a real support question and print its answer.

Cross-folder assumption (see AGENTS.md): this script is not a Pulumi project.
It reads outputs from three already-deployed stacks via `pulumi stack output
--json`, using the fully-qualified stack name form the local file backend
requires (`organization/<project>/<stack>`):

  - organization/itops-foundry-platform/dev  -> project_endpoint
  - organization/itops-agent/dev             -> agent_name
  - organization/itops-tool-connection/dev   -> connection_name (display only)

It then asks the deployed agent an IT-ops question with the azure-ai-projects
SDK and prints the answer.

Expected result when run against a live deployment: the agent's answer
should cite one of the runbook file names uploaded to the storage account in
04-tool-connection, because the agent's tool definition points its
file/knowledge search at that container. This script has NOT been run
against a live Azure deployment during this build (no Azure credentials on
the build workstation); the SDK calls below are exercised only for
import/syntax correctness (`python3 -m py_compile`).

SDK correction (verified 2026-09-29 against the installed `azure-ai-projects`
2.7.0 package, not the quickstart doc): `AIProjectClient.get_openai_client()`
raises `ValueError` when called with `agent_name=...` unless the client was
constructed with `allow_preview=True`. The Microsoft Learn quickstart's
Python sample does not show `allow_preview=True` in its `AIProjectClient(...)`
constructor call, but the installed package's docstring is unambiguous, so
this script follows the installed package.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

# Fully-qualified stack names (local file backend requires the
# "organization/<project>/<stack>" form -- a bare "<project>/<stack>" errors
# "organization name must be 'organization'"). Override via env vars if a
# presenter renamed a project or stack.
PLATFORM_STACK = os.environ.get("ITOPS_PLATFORM_STACK", "organization/itops-foundry-platform/dev")
AGENT_STACK = os.environ.get("ITOPS_AGENT_STACK", "organization/itops-agent/dev")
TOOL_CONNECTION_STACK = os.environ.get("ITOPS_TOOL_CONNECTION_STACK", "organization/itops-tool-connection/dev")

DEFAULT_QUESTION = (
    "One of our services is hung and not responding to health checks -- "
    "what should I do?"
)


def stack_output(stack: str, key: str) -> str:
    """Return one output value from an already-deployed Pulumi stack.

    Runs `pulumi stack output --stack <stack> --json` as a subprocess (this
    script is not itself a Pulumi program) and indexes into the resulting
    dict. Raises a clear error naming the stack and key on any failure.
    """
    try:
        result = subprocess.run(
            ["pulumi", "stack", "output", "--stack", stack, "--json"],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(
            f"`pulumi stack output --stack {stack} --json` failed: {exc.stderr.strip()}"
        ) from exc
    outputs = json.loads(result.stdout)
    if key not in outputs:
        raise KeyError(
            f"stack {stack!r} has no output {key!r}; available outputs: {sorted(outputs)}"
        )
    return outputs[key]


def ask(question: str) -> str:
    """Send `question` to the deployed IT-ops agent and return its answer text."""
    project_endpoint = stack_output(PLATFORM_STACK, "project_endpoint")
    agent_name = stack_output(AGENT_STACK, "agent_name")
    connection_name = stack_output(TOOL_CONNECTION_STACK, "connection_name")

    print(f"Project endpoint  : {project_endpoint}", file=sys.stderr)
    print(f"Agent name        : {agent_name}", file=sys.stderr)
    print(f"Runbook connection: {connection_name}", file=sys.stderr)
    print(f"Question          : {question}", file=sys.stderr)
    print(file=sys.stderr)

    client = AIProjectClient(
        endpoint=project_endpoint,
        credential=DefaultAzureCredential(),
        # Required for get_openai_client(agent_name=...) below -- see the
        # SDK correction note in this file's module docstring.
        allow_preview=True,
    )

    # Bind an OpenAI-compatible client directly to this agent's endpoint, so
    # every call through it is already scoped to the agent's own deployment
    # and tools; no model= kwarg is needed on responses.create() below.
    openai_client = client.get_openai_client(agent_name=agent_name)

    conversation = openai_client.conversations.create()
    response = openai_client.responses.create(
        conversation=conversation.id,
        input=question,
    )
    return response.output_text


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "question",
        nargs="?",
        default=DEFAULT_QUESTION,
        help="IT-ops question to send to the agent (default: a hung-service health-check scenario).",
    )
    args = parser.parse_args()
    answer = ask(args.question)
    print(answer)


if __name__ == "__main__":
    main()
