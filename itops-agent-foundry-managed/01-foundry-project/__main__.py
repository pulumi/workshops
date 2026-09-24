"""Step 1 - the Foundry-enabled account and its project.

Resources, in order:

1. A resource group, fixed name `rg-itops-agent-foundry-managed` so later
   steps can reference it by name instead of by generated output.
2. A `cognitiveservices.Account` of kind `AIServices` with
   `allow_project_management=True`. That flag is what makes the account a
   Microsoft Foundry resource capable of holding standalone projects, rather
   than a legacy single-service Cognitive Services account. Source:
   pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/account/
   (read 2026-09-24) - see the `AllowProjectManagement` input description.
3. A `cognitiveservices.Project`, the child resource this workshop is about.
   Source: pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/project/
   (read 2026-09-24).
4. A `RoleAssignment` granting the deploying principal the "Foundry User"
   role (renamed from "Azure AI User"; GUID unchanged:
   53ca6127-db72-4b80-b1b0-d745d6d5456d) on the project, so the exercise
   script in 04-exercise-agent can call the data-plane SDK with the same
   `az login` identity used here. Source: learn.microsoft.com/azure/foundry/
   concepts/rbac-foundry (read 2026-09-24).

Known risk (say this out loud in the demo): community reports on
pulumi/pulumi-azure-native#4354 (closed as fixed in v3.28.0, but see the
2026-03-09 comment from austinbhale) describe an intermittent HTTP 500 from
Azure's Resource Manager when creating a `cognitiveservices.Project`, even
though the identical request succeeds from the Azure portal. If `pulumi up`
fails here with a 500 after several minutes, retry once; if it fails again,
fall back to creating the project with `az cognitiveservices account
project create` (see the manual fallback in the root README) and `pulumi
import` it into this stack, rather than abandoning the Pulumi program.
"""

import pulumi
from pulumi_azure_native import authorization, cognitiveservices, resources

config = pulumi.Config()
location = config.get("location") or "eastus2"

RESOURCE_GROUP_NAME = "rg-itops-agent-foundry-managed"
ACCOUNT_NAME = "itops-agent-foundry"
PROJECT_NAME = "itops-agent-project"

resource_group = resources.ResourceGroup(
    "resource-group",
    resource_group_name=RESOURCE_GROUP_NAME,
    location=location,
)

account = cognitiveservices.Account(
    "foundry-account",
    account_name=ACCOUNT_NAME,
    resource_group_name=resource_group.name,
    location=location,
    kind="AIServices",
    sku=cognitiveservices.SkuArgs(name="S0"),
    identity=cognitiveservices.IdentityArgs(
        type=cognitiveservices.ResourceIdentityType.SYSTEM_ASSIGNED,
    ),
    properties=cognitiveservices.AccountPropertiesArgs(
        custom_sub_domain_name=ACCOUNT_NAME,
        allow_project_management=True,
    ),
    tags={"workshop": "itops-agent-foundry-managed"},
)

project = cognitiveservices.Project(
    "foundry-project",
    account_name=account.name,
    project_name=PROJECT_NAME,
    resource_group_name=resource_group.name,
    location=location,
    identity=cognitiveservices.IdentityArgs(
        type=cognitiveservices.ResourceIdentityType.SYSTEM_ASSIGNED,
    ),
    properties=cognitiveservices.ProjectPropertiesArgs(
        display_name="IT Ops managed agent",
        description="Workshop project for a managed IT-ops agent in Microsoft Foundry.",
    ),
)

caller = authorization.get_client_config()

foundry_user_role_assignment = authorization.RoleAssignment(
    "foundry-user-role-assignment",
    scope=pulumi.Output.concat(
        "/subscriptions/",
        caller.subscription_id,
        "/resourceGroups/",
        resource_group.name,
        "/providers/Microsoft.CognitiveServices/accounts/",
        account.name,
        "/projects/",
        project.name,
    ),
    principal_id=caller.object_id,
    principal_type=authorization.PrincipalType.USER,
    role_definition_id=pulumi.Output.concat(
        "/subscriptions/",
        caller.subscription_id,
        "/providers/Microsoft.Authorization/roleDefinitions/53ca6127-db72-4b80-b1b0-d745d6d5456d",
    ),
)

pulumi.export("resourceGroupName", resource_group.name)
pulumi.export("accountName", account.name)
pulumi.export("projectName", project.name)
pulumi.export(
    "projectEndpoint",
    pulumi.Output.concat(
        "https://", account.name, ".services.ai.azure.com/api/projects/", project.name
    ),
)
# The project's own system-assigned managed identity, not the deploying
# user's - 03-tool-connection grants this principal read access to the
# runbook storage account, since the ProjectConnection authenticates as the
# project, not as whoever ran `pulumi up` here.
pulumi.export("projectPrincipalId", project.identity.principal_id)
