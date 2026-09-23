"""Step 3: an Azure OpenAI (Cognitive Services) account + a GPT-4o deployment.

`pulumi up` here produces a Cognitive Services account of kind OpenAI with a
GPT-4o-class model deployment; verify with `az cognitiveservices account
show` and `az cognitiveservices account deployment list`.

`disable_local_auth=True` on the account turns off API-key auth entirely —
step 4 grants the AKS workload's managed identity the "Cognitive Services
OpenAI User" role instead, so no key is ever generated for this account.

Fallback for the "Azure OpenAI quota/region approval" risk in the brief: set
`createOpenAI: "false"` and provide `existingResourceGroup` /
`existingAccountName` / `existingDeploymentName` to point this stack at a
pre-provisioned account and deployment, skip creation, and start the live
demo at step 4 instead.
"""

import pulumi
from pulumi_azure_native import cognitiveservices

config = pulumi.Config()
location = config.get("location") or "eastus2"
resource_group_name_cfg = config.require("resourceGroupName")
create_openai = config.get_bool("createOpenAI")
if create_openai is None:
    create_openai = True
existing_resource_group = config.get("existingResourceGroup")
existing_account_name = config.get("existingAccountName")
existing_deployment_name = config.get("existingDeploymentName")

ACCOUNT_NAME = "itops-agent-openai"
DEPLOYMENT_NAME = "itops-agent-gpt-4o"
# 2024-11-20 is the current, non-deprecated GPT-4o version as of 2026-09-22
# (learn.microsoft.com/azure/foundry/openai/concepts/retired-models); the
# 2024-05-13 and 2024-08-06 versions are deprecated.
MODEL_VERSION = "2024-11-20"

if create_openai:
    account = cognitiveservices.Account(
        "itops-agent-openai",
        account_name=ACCOUNT_NAME,
        resource_group_name=resource_group_name_cfg,
        location=location,
        kind="OpenAI",
        sku=cognitiveservices.SkuArgs(name="S0"),
        identity=cognitiveservices.IdentityArgs(
            type=cognitiveservices.ResourceIdentityType.SYSTEM_ASSIGNED,
        ),
        properties=cognitiveservices.AccountPropertiesArgs(
            custom_sub_domain_name=ACCOUNT_NAME,
            disable_local_auth=True,
        ),
        tags={
            "workshop": "itops-agent-aks-azure-openai",
            "managed-by": "pulumi",
        },
    )

    deployment = cognitiveservices.Deployment(
        "itops-agent-gpt-4o",
        account_name=account.name,
        deployment_name=DEPLOYMENT_NAME,
        resource_group_name=resource_group_name_cfg,
        properties=cognitiveservices.DeploymentPropertiesArgs(
            model=cognitiveservices.DeploymentModelArgs(
                format="OpenAI",
                name="gpt-4o",
                version=MODEL_VERSION,
            ),
        ),
        sku=cognitiveservices.SkuArgs(
            name="GlobalStandard",
            capacity=10,
        ),
        opts=pulumi.ResourceOptions(depends_on=[account]),
    )

    account_name_out = account.name
    account_id_out = account.id
    endpoint_out = account.properties.endpoint
    deployment_name_out = deployment.name
else:
    if not (existing_resource_group and existing_account_name and existing_deployment_name):
        raise ValueError(
            "createOpenAI is false: set existingResourceGroup, "
            "existingAccountName and existingDeploymentName to point at a "
            "pre-provisioned account + deployment"
        )
    existing_account = cognitiveservices.get_account_output(
        resource_group_name=existing_resource_group,
        account_name=existing_account_name,
    )
    existing_deployment = cognitiveservices.get_deployment_output(
        resource_group_name=existing_resource_group,
        account_name=existing_account_name,
        deployment_name=existing_deployment_name,
    )
    account_name_out = existing_account.name
    account_id_out = existing_account.id
    endpoint_out = existing_account.properties.endpoint
    deployment_name_out = existing_deployment.name

pulumi.export("accountName", account_name_out)
pulumi.export("accountId", account_id_out)
pulumi.export("endpoint", endpoint_out)
pulumi.export("deploymentName", deployment_name_out)
