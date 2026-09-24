"""Step 4 - ask the managed agent a real IT-ops question.

Not a Pulumi program: this is the data-plane step. Everything the agent
needs already exists as Azure resources (steps 1-3); this script uses the
`azure-ai-projects` / `azure-ai-agents` SDKs to configure the agent's
behaviour (its model, instructions and tools are data-plane concepts, not
Pulumi resource properties - see the docstring in
../02-create-agent/__main__.py) and then asks it a question a real on-call
engineer would ask.

The agent is given one function tool, `get_runbook`, which reads the
runbook uploaded to the blob container from step 3 through the same
AAD-authenticated connection (no storage key touches this script or the
agent). This is the "connect the agent to a real IT-ops tool or data
source" outcome from the brief, made concrete as a function call the model
decides to make rather than a document dumped into its prompt.

Client library sources (read 2026-09-24):
- learn.microsoft.com/python/api/overview/azure/ai-projects-readme
  (`AIProjectClient`, endpoint form
  `https://<account>.services.ai.azure.com/api/projects/<project>`,
  `DefaultAzureCredential`)
- learn.microsoft.com/python/api/overview/azure/ai-agents-readme
  (`create_agent`, `FunctionTool`, `ToolSet`, `enable_auto_function_calls`,
  `runs.create_and_process`)

Usage:
    export FOUNDRY_PROJECT_ENDPOINT=$(pulumi stack output projectEndpoint --cwd ../01-foundry-project)
    export MODEL_DEPLOYMENT_NAME=itops-agent-gpt-4o
    python exercise_agent.py
"""

import os
import sys
from typing import Set

from azure.ai.agents.models import FunctionTool, ToolSet
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

STORAGE_ACCOUNT_NAME = "itopsagentrunbooks"
CONTAINER_NAME = "runbooks"
BLOB_NAME = "restart-web-tier.md"

AGENT_NAME = "itops-agent-exercise"
AGENT_INSTRUCTIONS = (
    "You are an on-call assistant for a platform engineering team. When "
    "asked about an incident, call get_runbook to fetch the relevant "
    "runbook before answering, and quote the concrete commands from it."
)


def get_runbook() -> str:
    """Fetch the on-call runbook for the web tier from blob storage."""
    credential = DefaultAzureCredential()
    account_url = f"https://{STORAGE_ACCOUNT_NAME}.blob.core.windows.net"
    client = BlobServiceClient(account_url=account_url, credential=credential)
    blob_client = client.get_container_client(CONTAINER_NAME).get_blob_client(BLOB_NAME)
    return blob_client.download_blob().readall().decode("utf-8")


user_functions: Set = {get_runbook}


def main() -> int:
    endpoint = os.environ.get("FOUNDRY_PROJECT_ENDPOINT")
    model = os.environ.get("MODEL_DEPLOYMENT_NAME", "itops-agent-gpt-4o")
    if not endpoint:
        print(
            "Set FOUNDRY_PROJECT_ENDPOINT to the projectEndpoint output "
            "from 01-foundry-project (pulumi stack output projectEndpoint).",
            file=sys.stderr,
        )
        return 1

    with DefaultAzureCredential() as credential, AIProjectClient(
        endpoint=endpoint, credential=credential
    ) as project_client:
        agents_client = project_client.agents

        functions = FunctionTool(user_functions)
        toolset = ToolSet()
        toolset.add(functions)
        agents_client.enable_auto_function_calls(toolset)

        agent = agents_client.create_agent(
            model=model,
            name=AGENT_NAME,
            instructions=AGENT_INSTRUCTIONS,
            toolset=toolset,
        )

        thread = agents_client.threads.create()
        agents_client.messages.create(
            thread_id=thread.id,
            role="user",
            content="The web frontend is returning 502s. What do I do?",
        )

        run = agents_client.runs.create_and_process(thread_id=thread.id, agent_id=agent.id)
        if run.status == "failed":
            print(f"Run failed: {run.last_error}", file=sys.stderr)
            return 1

        messages = agents_client.messages.list(thread_id=thread.id)
        for message in messages:
            if message.role == "assistant" and message.text_messages:
                print(message.text_messages[-1].text.value)
                break

        agents_client.delete_agent(agent.id)

    return 0


if __name__ == "__main__":
    sys.exit(main())
