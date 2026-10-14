"""Pulumi program: creates the IT-ops Foundry prompt agent.

The Foundry agent has no azure-native (ARM) resource type -- Microsoft
Learn's "Create a prompt agent" quickstart
(learn.microsoft.com/en-us/azure/foundry/agents/quickstarts/prompt-agent,
read 2026-09-29) creates agents only through the data-plane azure-ai-projects
SDK or a direct REST call to the project's `.services.ai.azure.com` host --
there is no Bicep/ARM/Terraform tab on that page. This program wraps
`agent.py`, a standalone script that calls that SDK, in a
`pulumi_command.local.Command` so `pulumi up` / `pulumi destroy` still drive
its lifecycle. See AGENTS.md for the assumptions this file makes.
"""

import os

import pulumi
import pulumi_command as command

config = pulumi.Config()
agent_name = config.get("agent_name") or "it-ops-runbook-agent"

# Assumption: 02-foundry-platform's Pulumi.yaml `name:` field. This folder
# did not exist yet when 03-agent was built -- see AGENTS.md.
platform_stack_name = config.get("platform_stack") or "organization/itops-foundry-platform/dev"
platform = pulumi.StackReference(platform_stack_name)

project_endpoint = platform.get_output("project_endpoint")
deployment_name = platform.get_output("deployment_name")

script_path = os.path.join(os.path.dirname(__file__), "agent.py")

agent_lifecycle = command.local.Command(
    "it-ops-agent",
    create=pulumi.Output.concat(
        "python3 ", script_path,
        " create --endpoint '", project_endpoint,
        "' --agent-name '", agent_name,
        "' --deployment '", deployment_name, "'",
    ),
    delete=pulumi.Output.concat(
        "python3 ", script_path,
        " delete --endpoint '", project_endpoint,
        "' --agent-name '", agent_name, "'",
    ),
    triggers=[project_endpoint, agent_name, deployment_name],
)

# .apply() here only trims whitespace from the captured stdout string -- no
# resource is created inside it, per pulumi-best-practices.
agent_id = agent_lifecycle.stdout.apply(lambda s: s.strip())

pulumi.export("agent_name", agent_name)
pulumi.export("agent_id", agent_id)
