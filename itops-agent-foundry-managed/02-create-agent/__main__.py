"""Step 2 - the model deployment and the agent registration.

Two resources, both children of the account/project from step 1:

1. A `cognitiveservices.Deployment` for `gpt-4o`, model version `2024-11-20`
   - the current, non-deprecated GPT-4o version as of 2026-09-22 per
   learn.microsoft.com/azure/foundry/openai/concepts/retired-models (same
   source and read date as the sibling `itops-agent-aks-azure-openai`
   workshop's Azure OpenAI deployment, re-checked 2026-09-24). GPT-4o itself
   is now Azure's previous-generation tier rather than the current
   recommendation (cloudzero.com, accessed 2026-09-24, cites the GPT-5.x
   family as current) - it stays the workshop's model because it is cheap,
   fast enough for a live demo, and its price point is well documented; say
   so on the cost slide rather than presenting it as cutting-edge.
2. A `cognitiveservices.AgentApplication` - the Pulumi-managed resource that
   registers the agent as a first-class Azure resource (visible in cost
   management, access control, and the Foundry portal) under the project.
   Source: pulumi.com/registry/packages/azure-native/api-docs/
   cognitiveservices/agentapplication/ (read 2026-09-24).

What this resource does *not* do: `AgentApplication`'s own properties are
only `description` and `display_name` (confirmed against the registry
schema, not assumed) - it does not carry the agent's instructions, model
choice or tools. Those are data-plane concepts, set by calling the agents
SDK (`azure-ai-agents`) against the project endpoint, which is what step 3
and step 4 do. This split is normal for Foundry: Pulumi provisions the
account you can see a bill for; the SDK shapes what the agent actually does,
the same way Pulumi provisions an AKS cluster but a workload still gets
deployed onto it separately.
"""

import pulumi
from pulumi_azure_native import cognitiveservices

config = pulumi.Config()
account_name = config.require("accountName")
project_name = config.require("projectName")
resource_group_name = config.get("resourceGroupName") or "rg-itops-agent-foundry-managed"

DEPLOYMENT_NAME = "itops-agent-gpt-4o"
MODEL_VERSION = "2024-11-20"
AGENT_APPLICATION_NAME = "itops-agent"

deployment = cognitiveservices.Deployment(
    "gpt-4o-deployment",
    account_name=account_name,
    deployment_name=DEPLOYMENT_NAME,
    resource_group_name=resource_group_name,
    sku=cognitiveservices.SkuArgs(name="GlobalStandard", capacity=10),
    properties=cognitiveservices.DeploymentPropertiesArgs(
        model=cognitiveservices.DeploymentModelArgs(
            format="OpenAI",
            name="gpt-4o",
            version=MODEL_VERSION,
        ),
    ),
)

agent_application = cognitiveservices.AgentApplication(
    "agent-application",
    account_name=account_name,
    project_name=project_name,
    resource_group_name=resource_group_name,
    name=AGENT_APPLICATION_NAME,
    properties=cognitiveservices.AgenticApplicationPropertiesArgs(
        display_name="IT Ops runbook agent",
        description="Answers on-call questions from the runbook and ticket queue used in this workshop.",
    ),
)

pulumi.export("deploymentName", deployment.name)
pulumi.export("agentApplicationName", agent_application.name)
